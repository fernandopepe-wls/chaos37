package com.hackathon37.group34.bunnychaos;

import android.os.Debug;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeMemory")
public class NativeMemoryPlugin extends Plugin {

    @PluginMethod()
    public void getInfo(PluginCall call) {
        Runtime rt = Runtime.getRuntime();
        long jvmTotal = rt.totalMemory();
        long jvmFree = rt.freeMemory();
        long jvmMax = rt.maxMemory();

        Debug.MemoryInfo memInfo = new Debug.MemoryInfo();
        Debug.getMemoryInfo(memInfo);

        JSObject result = new JSObject();

        // JVM (Dalvik/ART) memory
        result.put("jvmUsed", jvmTotal - jvmFree);
        result.put("jvmTotal", jvmTotal);
        result.put("jvmMax", jvmMax);

        // Native heap (C/C++ allocations, including rendering engines)
        result.put("nativeHeapUsed", Debug.getNativeHeapAllocatedSize());
        result.put("nativeHeapTotal", Debug.getNativeHeapSize());
        result.put("nativeHeapFree", Debug.getNativeHeapFreeSize());

        // PSS = Proportional Set Size (best measure of total app memory footprint)
        // getTotalPss() returns KB, convert to bytes
        result.put("totalPss", (long) memInfo.getTotalPss() * 1024);
        result.put("dalvikPss", (long) memInfo.dalvikPss * 1024);
        result.put("nativePss", (long) memInfo.nativePss * 1024);
        result.put("otherPss", (long) memInfo.otherPss * 1024);

        result.put("available", true);

        call.resolve(result);
    }
}
