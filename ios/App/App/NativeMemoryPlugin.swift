import Foundation
import Capacitor

@objc(NativeMemoryPlugin)
public class NativeMemoryPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeMemoryPlugin"
    public let jsName = "NativeMemory"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getInfo", returnType: CAPPluginReturnPromise)
    ]

    @objc func getInfo(_ call: CAPPluginCall) {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4

        let result = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
                task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
            }
        }

        if result == KERN_SUCCESS {
            let resident = Int64(info.resident_size)
            let virtual = Int64(info.virtual_size)
            let availableMemory = Int64(os_proc_available_memory())
            let physicalMemory = Int64(ProcessInfo.processInfo.physicalMemory)

            call.resolve([
                "residentSize": resident,
                "virtualSize": virtual,
                "availableMemory": availableMemory,
                "physicalMemory": physicalMemory,
                "totalPss": resident,
                "available": true
            ])
        } else {
            call.resolve([
                "residentSize": 0,
                "virtualSize": 0,
                "availableMemory": 0,
                "physicalMemory": 0,
                "totalPss": 0,
                "available": false
            ])
        }
    }
}
