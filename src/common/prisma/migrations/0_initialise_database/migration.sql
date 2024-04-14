-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Unknown');

-- CreateEnum
CREATE TYPE "PasswordStrength" AS ENUM ('Normal', 'Medium', 'Strong');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(20),
    "email" VARCHAR(50) NOT NULL,
    "gender" "Gender",
    "password" VARCHAR(255) NOT NULL,
    "passwordUpdatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "passwordLockedAt" TIMESTAMPTZ(6),
    "passwordHistory" JSONB,
    "passwordAttempt" SMALLINT,
    "lastLogin" TIMESTAMPTZ(6),
    "lastLoginIp" VARCHAR(20),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "contactId" INTEGER NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR NOT NULL,
    "middleName" VARCHAR,
    "lastName" VARCHAR NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updatedBy" INTEGER,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_policy" (
    "id" SERIAL NOT NULL,
    "enforcePolicy" BOOLEAN NOT NULL DEFAULT false,
    "strength" "PasswordStrength" NOT NULL DEFAULT 'Normal',
    "minPasswordLength" SMALLINT NOT NULL,
    "passwordHistoryLength" SMALLINT NOT NULL,
    "expiryDuration" SMALLINT NOT NULL,
    "minPasswordAge" SMALLINT NOT NULL,
    "allowedAttempts" SMALLINT NOT NULL,
    "lockDuration" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "createdBy" INTEGER,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updatedBy" INTEGER,

    CONSTRAINT "password_policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_contactId_key" ON "users"("contactId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
