-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forks" JSONB NOT NULL,
    "activeFork" INTEGER,
    "stars" INTEGER[],
    "highlights" JSONB[],

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "chronologicalId" INTEGER NOT NULL,
    "chronologicalParentId" INTEGER,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reasoningContent" TEXT,
    "model" JSONB,
    "temperature" DOUBLE PRECISION,
    "topP" DOUBLE PRECISION,
    "usage" JSONB,
    "systemPromptId" TEXT,
    "systemPromptTitle" TEXT,
    "systemPromptIsDefault" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemPrompt" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_chatId_chronologicalId_idx" ON "Message"("chatId", "chronologicalId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
