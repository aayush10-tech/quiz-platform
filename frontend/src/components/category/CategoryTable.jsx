import { FaEdit, FaTrash } from "react-icons/fa";

export default function CategoryTable({

    categories,

    loading,

    onEdit,

    onDelete

}) {

    if (loading) {

        return (

            <div className="bg-white rounded-xl shadow p-10 text-center">

                Loading Categories...

            </div>

        );

    }

    if (categories.length === 0) {

        return (

            <div className="bg-white rounded-xl shadow p-10 text-center">

                No Categories Found

            </div>

        );

    }

    return (

        <div className="bg-white rounded-xl shadow overflow-hidden">

            <table className="w-full">

                <thead className="bg-slate-100">

                    <tr>

                        <th className="text-left p-4">

                            Name

                        </th>

                        <th className="text-left p-4">

                            Slug

                        </th>

                        <th className="text-left p-4">

                            Description

                        </th>

                        <th className="text-center p-4">

                            Actions

                        </th>

                    </tr>

                </thead>

                <tbody>

                    {

                        categories.map((category) => (

                            <tr

                                key={category.id}

                                className="border-t hover:bg-slate-50"

                            >

                                <td className="p-4">

                                    {category.name}

                                </td>

                                <td className="p-4">

                                    {category.slug}

                                </td>

                                <td className="p-4">

                                    {

                                        category.description ||

                                        "-"

                                    }

                                </td>

                                <td className="p-4">

                                    <div className="flex justify-center gap-3">

                                        <button

                                            onClick={() => onEdit(category)}

                                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded"

                                        >

                                            <FaEdit />

                                        </button>

                                        <button

                                            onClick={() => onDelete(category.id)}

                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"

                                        >

                                            <FaTrash />

                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}