import { NextResponse } from "next/server";
import { db, verifyPassword } from "@/lib/server/db";
import { createSessionCookie, sanitizeUser } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = db.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    // Guaranteed admin fallback
    if (normalizedEmail === "admin@gmail.com" && password === "123456789") {
      if (!user) {
        user = {
          id: "usr_admin_demo",
          name: "Administrateur ToumAnina",
          email: "admin@gmail.com",
          phone: "+213 550 00 00 00",
          role: "admin",
          passwordHash: "",
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      }
    } else if (normalizedEmail === "famille.demo@toumoanina.app" && password === "Famille123!") {
      if (!user) {
        user = {
          id: "usr_family_demo",
          name: "Famille Benali",
          email: "famille.demo@toumoanina.app",
          phone: "+213 549 18 19 11",
          role: "family",
          patientExitPin: "1234",
          passwordHash: "",
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      }
    } else if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Identifiants invalides. Vérifiez votre email et mot de passe." },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Ce compte est désactivé. Veuillez contacter l'administrateur." },
        { status: 403 }
      );
    }

    const token = await createSessionCookie(user);

    // Add audit log
    db.logs.unshift({
      id: `log_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      action: "AUTH_LOGIN",
      details: `Connexion réussie (${user.role})`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
      token,
      redirectUrl: user.role === "admin" ? "/admin/dashboard" : "/family/dashboard",
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur lors de la connexion." },
      { status: 500 }
    );
  }
}
