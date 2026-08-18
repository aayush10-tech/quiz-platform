import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {

    getCategories,

    createCategory,

    updateCategory,

    deleteCategory

} from "../services/category.service";

export default function useCategories() {

    const [categories, setCategories] = useState([]);

    const [page, setPage] = useState(1);

    const [limit] = useState(10);

    const [search, setSearch] = useState("");

    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(false);

    const fetchCategories = async () => {

        try {

            setLoading(true);

            const response = await getCategories(

                page,

                limit,

                search

            );

            setCategories(response.data.categories);

            setTotal(response.data.total);

        } catch (error) {

            toast.error(

                error.response?.data?.message ||

                "Failed to fetch categories"

            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchCategories();

    }, [page, search]);

    const addCategory = async (data) => {

        try {

            await createCategory(data);

            toast.success("Category Created");

            fetchCategories();

        } catch (error) {

            toast.error(

                error.response?.data?.message ||

                "Failed"

            );

        }

    };

    const editCategory = async (id, data) => {

        try {

            await updateCategory(id, data);

            toast.success("Category Updated");

            fetchCategories();

        } catch (error) {

            toast.error(

                error.response?.data?.message ||

                "Failed"

            );

        }

    };

    const removeCategory = async (id) => {

        if (!window.confirm("Delete this category?")) {

            return;

        }

        try {

            await deleteCategory(id);

            toast.success("Category Deleted");

            fetchCategories();

        } catch (error) {

            toast.error(

                error.response?.data?.message ||

                "Failed"

            );

        }

    };

    return {

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

        removeCategory,

        refresh: fetchCategories

    };

}