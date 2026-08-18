import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function CategoryForm({

    initialData,

    onSubmit,

    loading,

    onCancel

}) {

    const {

        register,

        handleSubmit,

        reset,

        formState: { errors }

    } = useForm({

        defaultValues: {

            name: "",

            description: ""

        }

    });

    useEffect(() => {

        if (initialData) {

            reset({

                name: initialData.name,

                description: initialData.description || ""

            });

        } else {

            reset({

                name: "",

                description: ""

            });

        }

    }, [initialData, reset]);

    return (

        <form

            onSubmit={handleSubmit(onSubmit)}

            className="space-y-5"

        >

            <div>

                <label className="block mb-2 font-medium">

                    Category Name

                </label>

                <input

                    type="text"

                    className="w-full border rounded-lg p-3"

                    placeholder="Enter category name"

                    {...register("name", {

                        required: "Category name is required"

                    })}

                />

                <p className="text-red-500 text-sm mt-1">

                    {errors.name?.message}

                </p>

            </div>

            <div>

                <label className="block mb-2 font-medium">

                    Description

                </label>

                <textarea

                    rows={4}

                    className="w-full border rounded-lg p-3 resize-none"

                    placeholder="Enter description"

                    {...register("description")}

                />

            </div>

            <div className="flex justify-end gap-3">

                <button

                    type="button"

                    onClick={onCancel}

                    className="px-5 py-2 rounded-lg border"

                >

                    Cancel

                </button>

                <button

                    type="submit"

                    disabled={loading}

                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"

                >

                    {

                        loading

                            ? "Saving..."

                            : initialData

                                ? "Update Category"

                                : "Add Category"

                    }

                </button>

            </div>

        </form>

    );

}