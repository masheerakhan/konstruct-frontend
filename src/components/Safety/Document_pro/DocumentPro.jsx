import { useState } from "react";
import { Folder, Plus, X } from "lucide-react";

function DocumentPro() {
    const [folders, setFolders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [folderName, setFolderName] = useState("");

    const handleAddFolder = () => {
        if (!folderName.trim()) return;

        const newFolder = {
            id: Date.now(),
            name: folderName,
        };

        setFolders([...folders, newFolder]);
        setFolderName("");
        setShowModal(false);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Document Management</h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Add Folder
                </button>
            </div>

            {/* Folder Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {folders.map((folder) => (
                    <div
                        key={folder.id}
                        className="flex flex-col items-center justify-center p-4 border rounded-lg hover:shadow-md cursor-pointer"
                    >
                        <Folder size={40} className="text-yellow-500" />
                        <p className="mt-2 text-sm text-center">{folder.name}</p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[350px] p-6 relative">

                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            <X size={20} />
                        </button>

                        {/* Modal Content */}
                        <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>

                        <input
                            type="text"
                            placeholder="Enter folder name"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            className="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFolder}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DocumentPro;