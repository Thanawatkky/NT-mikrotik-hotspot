import '@/lib/routerMonitor';
import { deleteRouter } from "@/services/routers-service";
import {  NextRequest, NextResponse } from "next/server";
type Params = Promise<{ id: string }>

export async function DELETE(req: NextRequest, params : { params: Params}) {
    const  param  = await params.params;
    try {
        const del = await deleteRouter(String(param.id));
        if (!del) {
            return  NextResponse.json("Router not found", { status: 404 });
        } 
            return  NextResponse.json("Router deleted successfully", { status: 200 });
        
    } catch (error) {
        console.error("Error deleting router:", error);
        return  NextResponse.json("Failed to delete router", { status: 500 });
    }
}