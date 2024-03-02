import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
    const body = await req.json()
    const res = await fetch(process.env.ROUTE_BOUNDER_API!, {
        method: 'POST',
        body: JSON.stringify(body),
    })
    return NextResponse.json(await res.json())
}
