import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const messages = await db.collection("messages").find({}).sort({ timestamp: 1 }).limit(100).toArray()

    return NextResponse.json({
      messages: messages.map((msg) => ({
        ...msg,
        _id: msg._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, sender } = await request.json()

    if (!content || !sender) {
      return NextResponse.json({ error: "Content and sender are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const message = {
      content: content.trim(),
      sender: sender.trim(),
      timestamp: new Date(),
    }

    const result = await db.collection("messages").insertOne(message)

    return NextResponse.json({
      message: {
        ...message,
        _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
