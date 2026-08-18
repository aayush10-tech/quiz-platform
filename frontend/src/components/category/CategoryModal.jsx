import CategoryForm from "./CategoryForm";

export default function CategoryModal({

    open,

    title,

    initialData,

    loading,

    onSubmit,

    onClose

}) {

    if (!open) {

        return null;

    }

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">

                <div className="flex items-center justify-between mb-6">

                    <h2 className="text-2xl font-bold">

                        {title}

                    </h2>

                    <button

                        onClick={onClose}

                        className="text-gray-500 hover:text-red-500 text-xl"

                    >

                        ✕

                    </button>

                </div>

                <CategoryForm

                    initialData={initialData}

                    onSubmit={onSubmit}

                    loading={loading}

                    onCancel={onClose}

                />

            </div>

        </div>

    );

}