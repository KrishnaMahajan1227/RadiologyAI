import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Check if admin already exists
    const checkRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    const usersData = await checkRes.json();
    const existingAdmin = (usersData.users ?? []).find(
      (u: { email: string }) => u.email === "admin@radai.com"
    );

    if (existingAdmin) {
      // Update profile if admin exists
      const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${existingAdmin.id}`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        method: "PATCH",
        body: JSON.stringify({
          name: "Dr. Admin",
          role: "superadmin",
          hospital_name: "RadAI General Hospital",
          hospital_address: "123 Medical Center Drive, Healthcare City, 110001",
          hospital_phone: "+91 1234 567 890",
          doctor_credentials: "MD, DNB, FRCR",
          registration_number: "MCI-2026-00001",
          designation: "Head of Radiology",
          department: "Department of Radiology & Imaging",
          signature_line: true,
        }),
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Admin user already exists",
          user_id: existingAdmin.id,
          email: "admin@radai.com",
          password: "RadAI@2026",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin user via admin API
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@radai.com",
        password: "RadAI@2026",
        email_confirm: true,
        user_metadata: {
          name: "Dr. Admin",
          role: "superadmin",
        },
        app_metadata: {
          role: "superadmin",
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create admin: ${err}`);
    }

    const newAdmin = await createRes.json();
    const adminId = newAdmin.id;

    // Wait a moment for the user to be fully created
    await new Promise((r) => setTimeout(r, 1000));

    // Update profile with hospital details
    await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: "PATCH",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: "Dr. Admin",
        role: "superadmin",
        hospital_name: "RadAI General Hospital",
        hospital_address: "123 Medical Center Drive, Healthcare City, 110001",
        hospital_phone: "+91 1234 567 890",
        doctor_credentials: "MD, DNB, FRCR",
        registration_number: "MCI-2026-00001",
        designation: "Head of Radiology",
        department: "Department of Radiology & Imaging",
        signature_line: true,
      }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        user_id: adminId,
        email: "admin@radai.com",
        password: "RadAI@2026",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
