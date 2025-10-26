import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-66c2aef3/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to check user data
app.get("/make-server-66c2aef3/debug/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const userData = await kv.get(`user:${userId}`);
    const studentData = await kv.get(`student:${userId}`);
    const workoutHistory = await kv.getByPrefix(`workout-history:${userId}:`);
    const achievements = await kv.get(`achievements:${userId}`);
    
    return c.json({
      userData,
      studentData,
      workoutHistoryCount: workoutHistory?.length || 0,
      workoutHistory,
      achievements
    });
  } catch (error) {
    console.log('Error in debug:', error);
    return c.json({ error: 'Debug failed' }, 500);
  }
});

// Simple reset endpoint (just resets counters, doesn't delete history)
app.post("/make-server-66c2aef3/reset-stats-simple", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('Simple reset for user:', user.id);

    const studentData = await kv.get(`student:${user.id}`);
    
    await kv.set(`student:${user.id}`, {
      userId: user.id,
      height: studentData?.height || null,
      weight: studentData?.weight || null,
      goal: studentData?.goal || null,
      workoutsCompleted: 0,
      currentStreak: 0,
      totalPoints: 0,
      assignedTemplates: studentData?.assignedTemplates || []
    });
    
    await kv.set(`achievements:${user.id}`, { earned: [] });
    
    console.log('Simple reset complete');
    
    return c.json({ success: true, message: 'Stats reset successfully (simple mode)' });
  } catch (error) {
    console.log('Error in simple reset:', error);
    return c.json({ error: 'Failed to reset stats', details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// Full reset student stats (for debugging/testing)
app.post("/make-server-66c2aef3/reset-stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.log('Reset stats: No access token');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Reset stats: Auth error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('Resetting stats for user:', user.id);

    // Get current student data to preserve goal, height, weight
    let studentData;
    try {
      studentData = await kv.get(`student:${user.id}`);
      console.log('Current student data:', studentData);
    } catch (getError) {
      console.log('Error getting student data:', getError);
      throw new Error('Failed to get student data: ' + (getError instanceof Error ? getError.message : String(getError)));
    }
    
    // Reset stats but keep personal info
    const resetData = {
      userId: user.id,
      height: studentData?.height || null,
      weight: studentData?.weight || null,
      goal: studentData?.goal || null,
      workoutsCompleted: 0,
      currentStreak: 0,
      totalPoints: 0,
      assignedTemplates: studentData?.assignedTemplates || []
    };
    
    console.log('Setting reset data:', resetData);
    try {
      await kv.set(`student:${user.id}`, resetData);
      console.log('Student data reset complete');
    } catch (setError) {
      console.log('Error setting student data:', setError);
      throw new Error('Failed to set student data: ' + (setError instanceof Error ? setError.message : String(setError)));
    }
    
    // Clear workout history - need to query directly to get keys
    try {
      console.log('Querying workout history...');
      const { data: historyKeys, error: queryError } = await supabase
        .from('kv_store_66c2aef3')
        .select('key')
        .like('key', `workout-history:${user.id}:%`);
      
      if (queryError) {
        console.log('Error querying workout history:', queryError);
        // Don't fail the whole operation, just log it
      } else {
        console.log('Found workout history keys:', historyKeys?.length || 0);
        
        if (historyKeys && historyKeys.length > 0) {
          const keys = historyKeys.map((item: any) => item.key);
          console.log('Deleting keys:', keys);
          
          try {
            await kv.mdel(keys);
            console.log('Workout history cleared');
          } catch (delError) {
            console.log('Error deleting workout history:', delError);
            // Continue even if deletion fails
          }
        } else {
          console.log('No workout history to clear');
        }
      }
    } catch (historyError) {
      console.log('Error clearing workout history:', historyError);
      // Continue even if this fails
    }
    
    // Clear achievements
    try {
      console.log('Clearing achievements...');
      await kv.set(`achievements:${user.id}`, { earned: [] });
      console.log('Achievements cleared');
    } catch (achError) {
      console.log('Error clearing achievements:', achError);
      // Continue even if this fails
    }
    
    console.log('Stats reset complete for user:', user.id);
    
    return c.json({ success: true, message: 'Stats reset successfully' });
  } catch (error) {
    console.log('Error resetting stats (full error):', error);
    console.log('Error message:', error instanceof Error ? error.message : String(error));
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to reset stats', details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// ==================== AUTH ROUTES ====================

// Sign up endpoint
app.post("/make-server-66c2aef3/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, role, height, weight, goal } = body;

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we don't have email configured
      user_metadata: {
        name,
        role,
        ...(role === 'student' && { height, weight, goal })
      }
    });

    if (error) {
      console.log('Error creating user in Supabase Auth:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    });

    // Store student-specific data
    if (role === 'student') {
      await kv.set(`student:${userId}`, {
        userId,
        height: height || null,
        weight: weight || null,
        goal: goal || null,
        workoutsCompleted: 0,
        currentStreak: 0,
        totalPoints: 0,
        assignedTemplates: []
      });
    }

    // Store professor-specific data
    if (role === 'professor') {
      await kv.set(`professor:${userId}`, {
        userId,
        students: [],
        templates: []
      });
    }

    return c.json({ 
      user: {
        id: userId,
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.log('Error in signup:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Sign in endpoint
app.post("/make-server-66c2aef3/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // This would normally use Supabase client-side auth
    // For server-side, we'll validate and return user info
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Error signing in:', error);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${data.user.id}`);

    return c.json({ 
      user: userData,
      session: data.session
    });
  } catch (error) {
    console.log('Error in signin:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Get current user
app.get("/make-server-66c2aef3/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    
    if (userData && userData.role === 'student') {
      const studentData = await kv.get(`student:${user.id}`);
      return c.json({ ...userData, ...studentData });
    } else if (userData && userData.role === 'professor') {
      const professorData = await kv.get(`professor:${user.id}`);
      return c.json({ ...userData, ...professorData });
    }

    return c.json(userData);
  } catch (error) {
    console.log('Error getting current user:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// ==================== WORKOUT ROUTES (Students) ====================

// Get workouts for student
app.get("/make-server-66c2aef3/workouts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workouts = await kv.getByPrefix(`workout:${user.id}:`);
    return c.json(workouts);
  } catch (error) {
    console.log('Error getting workouts:', error);
    return c.json({ error: 'Failed to get workouts' }, 500);
  }
});

// Create workout
app.post("/make-server-66c2aef3/workouts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const workoutId = `${Date.now()}`;
    const workout = {
      id: workoutId,
      userId: user.id,
      ...body,
      createdAt: new Date().toISOString()
    };

    await kv.set(`workout:${user.id}:${workoutId}`, workout);
    return c.json(workout);
  } catch (error) {
    console.log('Error creating workout:', error);
    return c.json({ error: 'Failed to create workout' }, 500);
  }
});

// Update workout
app.put("/make-server-66c2aef3/workouts/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workoutId = c.req.param('id');
    const body = await c.req.json();
    
    const existingWorkout = await kv.get(`workout:${user.id}:${workoutId}`);
    if (!existingWorkout) {
      return c.json({ error: 'Workout not found' }, 404);
    }

    const workout = {
      ...existingWorkout,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`workout:${user.id}:${workoutId}`, workout);
    return c.json(workout);
  } catch (error) {
    console.log('Error updating workout:', error);
    return c.json({ error: 'Failed to update workout' }, 500);
  }
});

// Delete workout
app.delete("/make-server-66c2aef3/workouts/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workoutId = c.req.param('id');
    await kv.del(`workout:${user.id}:${workoutId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting workout:', error);
    return c.json({ error: 'Failed to delete workout' }, 500);
  }
});

// Complete workout (update stats)
app.post("/make-server-66c2aef3/workouts/:id/complete", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workoutId = c.req.param('id');
    const workout = await kv.get(`workout:${user.id}:${workoutId}`);
    
    if (!workout) {
      return c.json({ error: 'Workout not found' }, 404);
    }

    const completionId = Date.now();
    console.log('=== WORKOUT COMPLETION START ===');
    console.log('Completion ID:', completionId);
    console.log('Workout ID:', workoutId);
    console.log('User ID:', user.id);

    // Update workout last done (always update, allow multiple workouts per day)
    await kv.set(`workout:${user.id}:${workoutId}`, {
      ...workout,
      lastDone: new Date().toISOString()
    });

    // Update student stats with streak calculation
    const studentData = await kv.get(`student:${user.id}`);
    console.log('Current student data before update:', studentData);
    
    if (studentData) {
      const now = new Date();
      
      // Normalize dates to compare only date (not time)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastWorkout = studentData.lastWorkoutDate 
        ? new Date(studentData.lastWorkoutDate) 
        : null;
      
      let lastWorkoutDate = null;
      if (lastWorkout) {
        lastWorkoutDate = new Date(
          lastWorkout.getFullYear(), 
          lastWorkout.getMonth(), 
          lastWorkout.getDate()
        );
      }
      
      console.log('Last workout date (normalized):', lastWorkoutDate);
      console.log('Today (normalized):', today);
      
      let newStreak = 1;
      let shouldUpdateStreak = true;
      
      if (lastWorkoutDate) {
        const diffTime = today.getTime() - lastWorkoutDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        console.log('Days since last workout:', diffDays);
        
        // If worked out today already, keep same streak (don't increment)
        if (diffDays === 0) {
          newStreak = studentData.currentStreak || 1;
          shouldUpdateStreak = false; // Don't update lastWorkoutDate if same day
          console.log('Same day workout - keeping streak at:', newStreak);
        }
        // If worked out yesterday, increment streak
        else if (diffDays === 1) {
          newStreak = (studentData.currentStreak || 0) + 1;
          console.log('Consecutive day - incrementing streak to:', newStreak);
        }
        // If more than 1 day, reset streak
        else {
          newStreak = 1;
          console.log('Streak broken - resetting to:', newStreak);
        }
      } else {
        console.log('First workout ever - starting streak at 1');
      }
      
      console.log('Final new streak:', newStreak);
      
      // Award 50 points per workout (always, even multiple per day)
      const pointsToAdd = 50;
      const newTotalPoints = (studentData.totalPoints || 0) + pointsToAdd;
      const newWorkoutsCompleted = (studentData.workoutsCompleted || 0) + 1;
      
      console.log('Points to add:', pointsToAdd);
      console.log('New total points:', newTotalPoints);
      console.log('New workouts completed:', newWorkoutsCompleted);
      console.log('Should update streak date?', shouldUpdateStreak);
      
      // Update student data
      const updatedStudentData = {
        ...studentData,
        workoutsCompleted: newWorkoutsCompleted,
        totalPoints: newTotalPoints,
        currentStreak: newStreak,
        // Only update lastWorkoutDate if it's a new day (for streak tracking)
        lastWorkoutDate: shouldUpdateStreak ? now.toISOString() : studentData.lastWorkoutDate
      };
      
      console.log('Updated student data:', updatedStudentData);
      
      // Store workout completion history (always add, even multiple per day)
      // Use completionId to ensure uniqueness
      await kv.set(`workout-history:${user.id}:${completionId}`, {
        workoutId,
        completedAt: now.toISOString(),
        pointsEarned: pointsToAdd
      });
      
      console.log('Workout history saved with ID:', completionId);
      
      // Check and update achievements (pass updated data to avoid race conditions)
      const achievementPoints = await checkAndUpdateAchievements(user.id, {
        workoutsCompleted: newWorkoutsCompleted,
        currentStreak: newStreak,
        totalPoints: newTotalPoints
      });
      
      // Add achievement points to the total
      if (achievementPoints > 0) {
        console.log('Achievement points earned:', achievementPoints);
        updatedStudentData.totalPoints = newTotalPoints + achievementPoints;
      }
      
      // Save final student data (with achievement points if any)
      await kv.set(`student:${user.id}`, updatedStudentData);
      
      console.log('=== WORKOUT COMPLETION END ===');
      console.log('Completion ID:', completionId);
      console.log('Final workouts completed:', updatedStudentData.workoutsCompleted);
      console.log('Final total points:', updatedStudentData.totalPoints);
      console.log('Final streak:', updatedStudentData.currentStreak);
      console.log('===========================');
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Error completing workout:', error);
    return c.json({ error: 'Failed to complete workout' }, 500);
  }
});

// ==================== TEMPLATE ROUTES (Professors) ====================

// Get templates for professor
app.get("/make-server-66c2aef3/templates", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const templates = await kv.getByPrefix(`template:${user.id}:`);
    return c.json(templates);
  } catch (error) {
    console.log('Error getting templates:', error);
    return c.json({ error: 'Failed to get templates' }, 500);
  }
});

// Create template
app.post("/make-server-66c2aef3/templates", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const templateId = `${Date.now()}`;
    const template = {
      id: templateId,
      professorId: user.id,
      ...body,
      createdAt: new Date().toISOString()
    };

    await kv.set(`template:${user.id}:${templateId}`, template);
    return c.json(template);
  } catch (error) {
    console.log('Error creating template:', error);
    return c.json({ error: 'Failed to create template' }, 500);
  }
});

// Update template
app.put("/make-server-66c2aef3/templates/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const templateId = c.req.param('id');
    const body = await c.req.json();
    
    const existingTemplate = await kv.get(`template:${user.id}:${templateId}`);
    if (!existingTemplate) {
      return c.json({ error: 'Template not found' }, 404);
    }

    const template = {
      ...existingTemplate,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`template:${user.id}:${templateId}`, template);
    return c.json(template);
  } catch (error) {
    console.log('Error updating template:', error);
    return c.json({ error: 'Failed to update template' }, 500);
  }
});

// Delete template
app.delete("/make-server-66c2aef3/templates/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const templateId = c.req.param('id');
    await kv.del(`template:${user.id}:${templateId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting template:', error);
    return c.json({ error: 'Failed to delete template' }, 500);
  }
});

// ==================== STUDENT MANAGEMENT ROUTES (Professors) ====================

// Get students for professor
app.get("/make-server-66c2aef3/students", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const professorData = await kv.get(`professor:${user.id}`);
    const studentIds = professorData?.students || [];

    const students = [];
    for (const studentId of studentIds) {
      const userData = await kv.get(`user:${studentId}`);
      const studentData = await kv.get(`student:${studentId}`);
      if (userData && studentData) {
        students.push({
          ...userData,
          ...studentData,
          lastActive: studentData.lastWorkoutDate || userData.createdAt
        });
      }
    }

    return c.json(students);
  } catch (error) {
    console.log('Error getting students:', error);
    return c.json({ error: 'Failed to get students' }, 500);
  }
});

// Add student
app.post("/make-server-66c2aef3/students", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { name, email } = body;

    // Create student account
    const { data: studentAuthData, error: studentError } = await supabase.auth.admin.createUser({
      email,
      password: 'temporary123', // Student should change this
      email_confirm: true,
      user_metadata: {
        name,
        role: 'student'
      }
    });

    if (studentError) {
      console.log('Error creating student:', studentError);
      return c.json({ error: studentError.message }, 400);
    }

    const studentId = studentAuthData.user.id;

    // Store user data
    await kv.set(`user:${studentId}`, {
      id: studentId,
      name,
      email,
      role: 'student',
      createdAt: new Date().toISOString()
    });

    // Store student data
    await kv.set(`student:${studentId}`, {
      userId: studentId,
      workoutsCompleted: 0,
      currentStreak: 0,
      totalPoints: 0,
      assignedTemplates: []
    });

    // Add to professor's students
    const professorData = await kv.get(`professor:${user.id}`);
    await kv.set(`professor:${user.id}`, {
      ...professorData,
      students: [...(professorData?.students || []), studentId]
    });

    return c.json({
      id: studentId,
      name,
      email,
      workoutsCompleted: 0,
      assignedTemplates: []
    });
  } catch (error) {
    console.log('Error adding student:', error);
    return c.json({ error: 'Failed to add student' }, 500);
  }
});

// Assign template to students
app.post("/make-server-66c2aef3/templates/:id/assign", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const templateId = c.req.param('id');
    const body = await c.req.json();
    const { studentIds } = body;

    // Update template
    const template = await kv.get(`template:${user.id}:${templateId}`);
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }

    await kv.set(`template:${user.id}:${templateId}`, {
      ...template,
      assignedTo: studentIds
    });

    // Update each student's assigned templates
    for (const studentId of studentIds) {
      const studentData = await kv.get(`student:${studentId}`);
      if (studentData) {
        const currentTemplates = studentData.assignedTemplates || [];
        if (!currentTemplates.includes(templateId)) {
          await kv.set(`student:${studentId}`, {
            ...studentData,
            assignedTemplates: [...currentTemplates, templateId]
          });
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Error assigning template:', error);
    return c.json({ error: 'Failed to assign template' }, 500);
  }
});

// ==================== HELPER FUNCTIONS ====================

// Check and update achievements
// Returns total achievement points earned (to be added by caller)
async function checkAndUpdateAchievements(userId: string, stats: {
  workoutsCompleted: number;
  currentStreak: number;
  totalPoints: number;
}): Promise<number> {
  const achievements = [
    {
      id: 'first-workout',
      title: 'Primeiro Passo',
      description: 'Complete seu primeiro treino',
      icon: 'Target',
      points: 50,
      condition: () => stats.workoutsCompleted >= 1
    },
    {
      id: 'week-warrior',
      title: 'Guerreiro Semanal',
      description: 'Complete 7 treinos',
      icon: 'Calendar',
      points: 100,
      condition: () => stats.workoutsCompleted >= 7
    },
    {
      id: 'streak-5',
      title: 'Sequência de 5 Dias',
      description: 'Mantenha uma sequência de 5 dias',
      icon: 'Flame',
      points: 100,
      condition: () => stats.currentStreak >= 5
    },
    {
      id: 'streak-10',
      title: 'Mestre da Sequência',
      description: 'Mantenha uma sequência de 10 dias',
      icon: 'Flame',
      points: 200,
      condition: () => stats.currentStreak >= 10
    },
    {
      id: 'streak-30',
      title: 'Campeão da Consistência',
      description: 'Mantenha uma sequência de 30 dias',
      icon: 'Flame',
      points: 500,
      condition: () => stats.currentStreak >= 30
    },
    {
      id: 'monthly-champion',
      title: 'Campeão Mensal',
      description: 'Complete 20 treinos em um mês',
      icon: 'Trophy',
      points: 300,
      condition: () => stats.workoutsCompleted >= 20
    },
    {
      id: 'perfect-form',
      title: 'Forma Perfeita',
      description: 'Complete 50 treinos',
      icon: 'Star',
      points: 150,
      condition: () => stats.workoutsCompleted >= 50
    },
    {
      id: 'dedication',
      title: 'Dedicação Total',
      description: 'Complete 100 treinos',
      icon: 'Award',
      points: 500,
      condition: () => stats.workoutsCompleted >= 100
    }
  ];

  // Get current earned achievements
  const currentAchievements = await kv.get(`achievements:${userId}`) || { earned: [] };
  const earnedIds = currentAchievements.earned || [];
  
  let totalAchievementPoints = 0;
  const newlyEarnedAchievements = [];

  // Check which new achievements were earned
  for (const achievement of achievements) {
    if (!earnedIds.includes(achievement.id) && achievement.condition()) {
      earnedIds.push(achievement.id);
      newlyEarnedAchievements.push(achievement.id);
      totalAchievementPoints += achievement.points;
      
      console.log('New achievement unlocked:', achievement.title, '+', achievement.points, 'points');
    }
  }

  // Save updated achievements if any new ones were earned
  if (newlyEarnedAchievements.length > 0) {
    await kv.set(`achievements:${userId}`, { earned: earnedIds });
    console.log('Total achievement points this workout:', totalAchievementPoints);
  }
  
  return totalAchievementPoints;
}

// Calculate workout stats for a time period
function calculateWorkoutStats(workoutHistory: any[], days: number) {
  if (!workoutHistory || workoutHistory.length === 0) {
    return 0;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return workoutHistory.filter(w => {
    if (!w || !w.completedAt) return false;
    const workoutDate = new Date(w.completedAt);
    return workoutDate >= cutoffDate;
  }).length;
}

// ==================== GAMIFICATION ROUTES ====================

// Get gamification stats for student
app.get("/make-server-66c2aef3/gamification", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const studentData = await kv.get(`student:${user.id}`);
    const achievementsData = await kv.get(`achievements:${user.id}`) || { earned: [] };
    
    // Get workout history
    const workoutHistory = await kv.getByPrefix(`workout-history:${user.id}:`);
    
    // Log for debugging
    console.log('Student data:', studentData);
    console.log('Workout history:', workoutHistory);
    
    // Calculate weekly and monthly workouts
    const weeklyWorkouts = calculateWorkoutStats(workoutHistory, 7);
    const monthlyWorkouts = calculateWorkoutStats(workoutHistory, 30);
    
    console.log('Weekly workouts:', weeklyWorkouts);
    console.log('Monthly workouts:', monthlyWorkouts);
    
    // Define all achievements with progress
    const allAchievements = [
      {
        id: 'first-workout',
        title: 'Primeiro Passo',
        description: 'Complete seu primeiro treino',
        icon: 'Target',
        points: 50,
        earned: achievementsData.earned.includes('first-workout'),
        progress: studentData?.workoutsCompleted >= 1 ? 100 : 0
      },
      {
        id: 'week-warrior',
        title: 'Guerreiro Semanal',
        description: 'Complete 7 treinos',
        icon: 'Calendar',
        points: 100,
        earned: achievementsData.earned.includes('week-warrior'),
        progress: Math.min(100, ((studentData?.workoutsCompleted || 0) / 7) * 100)
      },
      {
        id: 'streak-5',
        title: 'Sequência de 5 Dias',
        description: 'Mantenha uma sequência de 5 dias',
        icon: 'Flame',
        points: 100,
        earned: achievementsData.earned.includes('streak-5'),
        progress: Math.min(100, ((studentData?.currentStreak || 0) / 5) * 100)
      },
      {
        id: 'streak-10',
        title: 'Mestre da Sequência',
        description: 'Mantenha uma sequência de 10 dias',
        icon: 'Flame',
        points: 200,
        earned: achievementsData.earned.includes('streak-10'),
        progress: Math.min(100, ((studentData?.currentStreak || 0) / 10) * 100)
      },
      {
        id: 'streak-30',
        title: 'Campeão da Consistência',
        description: 'Mantenha uma sequência de 30 dias',
        icon: 'Flame',
        points: 500,
        earned: achievementsData.earned.includes('streak-30'),
        progress: Math.min(100, ((studentData?.currentStreak || 0) / 30) * 100)
      },
      {
        id: 'monthly-champion',
        title: 'Campeão Mensal',
        description: 'Complete 20 treinos em um mês',
        icon: 'Trophy',
        points: 300,
        earned: achievementsData.earned.includes('monthly-champion'),
        progress: Math.min(100, ((studentData?.workoutsCompleted || 0) / 20) * 100)
      },
      {
        id: 'perfect-form',
        title: 'Forma Perfeita',
        description: 'Complete 50 treinos',
        icon: 'Star',
        points: 150,
        earned: achievementsData.earned.includes('perfect-form'),
        progress: Math.min(100, ((studentData?.workoutsCompleted || 0) / 50) * 100)
      },
      {
        id: 'dedication',
        title: 'Dedicação Total',
        description: 'Complete 100 treinos',
        icon: 'Award',
        points: 500,
        earned: achievementsData.earned.includes('dedication'),
        progress: Math.min(100, ((studentData?.workoutsCompleted || 0) / 100) * 100)
      }
    ];
    
    // Calculate rank based on points
    let rank = 'Bronze';
    let nextRank = 'Prata';
    let rankProgress = 0;
    const totalPoints = studentData?.totalPoints || 0;
    
    if (totalPoints >= 5000) {
      rank = 'Diamante';
      nextRank = 'Lenda';
      rankProgress = Math.min(100, ((totalPoints - 5000) / 5000) * 100);
    } else if (totalPoints >= 2500) {
      rank = 'Platina';
      nextRank = 'Diamante';
      rankProgress = ((totalPoints - 2500) / 2500) * 100;
    } else if (totalPoints >= 1000) {
      rank = 'Ouro';
      nextRank = 'Platina';
      rankProgress = ((totalPoints - 1000) / 1500) * 100;
    } else if (totalPoints >= 500) {
      rank = 'Prata';
      nextRank = 'Ouro';
      rankProgress = ((totalPoints - 500) / 500) * 100;
    } else {
      rank = 'Bronze';
      nextRank = 'Prata';
      rankProgress = (totalPoints / 500) * 100;
    }
    
    return c.json({
      streakCount: studentData?.currentStreak || 0,
      weeklyWorkouts,
      monthlyWorkouts,
      totalPoints: studentData?.totalPoints || 0,
      workoutsCompleted: studentData?.workoutsCompleted || 0,
      currentRank: rank,
      nextRank,
      nextRankProgress: Math.round(rankProgress),
      achievements: allAchievements,
      weeklyGoal: 6,
      monthlyGoal: 20
    });
  } catch (error) {
    console.log('Error getting gamification data:', error);
    return c.json({ error: 'Failed to get gamification data' }, 500);
  }
});

// Get profile data for student
app.get("/make-server-66c2aef3/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const studentData = await kv.get(`student:${user.id}`);
    
    console.log('Profile - User data:', userData);
    console.log('Profile - Student data:', studentData);
    
    // Get workout history for this month
    const workoutHistory = await kv.getByPrefix(`workout-history:${user.id}:`);
    const monthlyWorkouts = calculateWorkoutStats(workoutHistory, 30);
    
    console.log('Profile - Workout history count:', workoutHistory?.length || 0);
    console.log('Profile - Monthly workouts:', monthlyWorkouts);
    
    // Calculate rank
    let rank = 'Bronze';
    const totalPoints = studentData?.totalPoints || 0;
    if (totalPoints >= 5000) rank = 'Diamante';
    else if (totalPoints >= 2500) rank = 'Platina';
    else if (totalPoints >= 1000) rank = 'Ouro';
    else if (totalPoints >= 500) rank = 'Prata';
    
    return c.json({
      ...userData,
      goal: studentData?.goal || 'Não definido',
      height: studentData?.height || null,
      weight: studentData?.weight || null,
      rank,
      streakCount: studentData?.currentStreak || 0,
      workoutsCompleted: studentData?.workoutsCompleted || 0,
      monthlyWorkouts,
      totalPoints: studentData?.totalPoints || 0
    });
  } catch (error) {
    console.log('Error getting profile data:', error);
    return c.json({ error: 'Failed to get profile data' }, 500);
  }
});

// Update profile
app.put("/make-server-66c2aef3/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { name, email, goal, height, weight } = body;
    
    // Update user data
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      await kv.set(`user:${user.id}`, {
        ...userData,
        name: name || userData.name,
        email: email || userData.email
      });
    }
    
    // Update student-specific data
    if (userData?.role === 'student') {
      const studentData = await kv.get(`student:${user.id}`);
      if (studentData) {
        await kv.set(`student:${user.id}`, {
          ...studentData,
          goal: goal !== undefined ? goal : studentData.goal,
          height: height !== undefined ? height : studentData.height,
          weight: weight !== undefined ? weight : studentData.weight
        });
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

Deno.serve(app.fetch);
