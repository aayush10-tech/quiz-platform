import { useState } from "react";
import { FaPlus } from "react-icons/fa";

import useCategories from "../../hooks/useCategories";

import CategoryTable from "../../components/category/CategoryTable";
import CategoryModal from "../../components/category/CategoryModal";

export default function Categories() {

    const {

        categories,

        loading,

        page,

        total,

        limit,

        search,

        setPage,

        setSearch,

        addCategory,

        editCategory,

        removeCategory

    } = useCategories();

    const [open, setOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleAdd = async (data) => {

        await addCategory(data);

        setOpen(false);

    };

    const handleEdit = async (data) => {

        await editCategory(selectedCategory.id, data);

        setOpen(false);

        setSelectedCategory(null);

    };

    return (

        <div className="space-y-6">

            <div className="flex items-center justify-between">

                <h1 className="text-3xl font-bold">

                    Category Management

                </h1>

                <button

                    onClick={() => {

                        setSelectedCategory(null);

                        setOpen(true);

                    }}

                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2"

                >

                    <FaPlus />

                    Add Category

                </button>

            </div>

            <div className="bg-white rounded-xl shadow p-5">

                <input

                    type="text"

                    value={search}

                    onChange={(e) => {

                        setSearch(e.target.value);

                        setPage(1);

                    }}

                    placeholder="Search Category..."

                    className="border rounded-lg p-3 w-full"

                />

            </div>

            <CategoryTable

                categories={categories}

                loading={loading}

                onEdit={(category) => {

                    setSelectedCategory(category);

                    setOpen(true);

                }}

                onDelete={removeCategory}

            />

            <div className="flex justify-between">

                <button

                    disabled={page === 1}

                    onClick={() => setPage(page - 1)}

                    className="px-5 py-2 bg-slate-200 rounded"

                >

                    Previous

                </button>

                <div className="font-semibold">

                    Page {page} of {Math.ceil(total / limit) || 1}

                </div>

                <button

                    disabled={page >= Math.ceil(total / limit)}

                    onClick={() => setPage(page + 1)}

                    className="px-5 py-2 bg-slate-200 rounded"

                >

                    Next

                </button>

            </div>

            <CategoryModal

                open={open}

                title={

                    selectedCategory

                        ? "Edit Category"

                        : "Add Category"

                }

                initialData={selectedCategory}

                loading={loading}

                onClose={() => {

                    setOpen(false);

                    setSelectedCategory(null);

                }}

                onSubmit={

                    selectedCategory

                        ? handleEdit

                        : handleAdd

                }

            />

        </div>

    );

}