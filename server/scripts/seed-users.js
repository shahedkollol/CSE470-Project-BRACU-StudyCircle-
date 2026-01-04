/**
 * Seed script to create test accounts including admin
 * Run with: node scripts/seed-users.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// User schema (inline to avoid import issues)
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, select: false },
        department: { type: String, required: true },
        batch: { type: String, required: true },
        role: {
            type: String,
            enum: ["student", "alumni", "faculty", "admin"],
            default: "student",
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const testUsers = [
    {
        name: "CSE Coordinator",
        email: "coordinator@bracu.ac.bd",
        password: "CSEadmin!23",
        role: "admin",
        department: "CSE",
        batch: "2018",
    },
    {
        name: "Dr. Farzana Rahman",
        email: "farzana.rahman@bracu.ac.bd",
        password: "Mentor@CSE",
        role: "faculty",
        department: "CSE",
        batch: "2008",
    },
    {
        name: "Taufiq Hasan",
        email: "taufiq.hasan@bracu.ac.bd",
        password: "Study@52",
        role: "student",
        department: "CSE",
        batch: "52",
    },
    {
        name: "Shorna Mahmud",
        email: "shorna.mahmud@alumni.bracu.ac.bd",
        password: "Alumni@CSE",
        role: "alumni",
        department: "CSE",
        batch: "2020",
    },
];

async function seed() {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/studycircle";
        console.log("Connecting to MongoDB:", mongoUri);

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB ✅");

        for (const userData of testUsers) {
            const existing = await User.findOne({ email: userData.email });
            if (existing) {
                console.log(`User ${userData.email} already exists, skipping...`);
                continue;
            }

            const hashed = await bcrypt.hash(userData.password, 10);
            const user = await User.create({
                ...userData,
                password: hashed,
            });
            console.log(`Created: ${user.name} (${user.email}) - Role: ${user.role}`);
        }

        console.log("\n✅ Seed completed successfully!");
        console.log("\n=== ADMIN CREDENTIALS ===");
        console.log("Email: coordinator@bracu.ac.bd");
        console.log("Password: CSEadmin!23");
        console.log("========================\n");

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("Seed failed:", err.message);
        process.exit(1);
    }
}

seed();
