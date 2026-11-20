// import {
//     Dialog,
//     DialogContent,
// } from "@/components/ui/dialog";

// import FilePreview from "./FilePreview";

// const FileViewerModal = ({
//     open,
//     handleCancel,
//     fileUrl,
// }) => {

//     return (
//         <Dialog open={open} onOpenChange={handleCancel}>
//             <DialogContent className="max-w-5xl h-[60vh] p-2 overflow-hidden">
//                 {/* <p>dfghjk</p> */}
//                 <FilePreview fileUrl={fileUrl} />

//             </DialogContent>
//         </Dialog>
//     );
// };

// export default FileViewerModal;

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

import { X, FileText } from "lucide-react";

import FilePreview from "./FilePreview";

const FileViewerModal = ({
    open,
    handleCancel,
    fileUrl,
}) => {

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden [&>button]:hidden">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4 bg-slate-50">

                    {/* Left Side */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                            <FileText size={20} className="text-blue-600" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">
                                File Preview
                            </h2>

                            <p className="text-xs text-slate-500">
                                View uploaded document
                            </p>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleCancel}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="h-[calc(90vh-80px)] overflow-auto p-2">
                    <FilePreview fileUrl={fileUrl} />
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default FileViewerModal;