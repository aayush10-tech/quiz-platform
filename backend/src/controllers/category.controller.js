import asyncHandler from "../middleware/async.middleware.js";

import ApiResponse from "../utils/ApiResponse.js";

import { categorySchema } from "../validations/category.validation.js";

import {

createCategoryService,

getCategoriesService,

getCategoryByIdService,

updateCategoryService,

deleteCategoryService

} from "../services/category.service.js";

export const createCategory=asyncHandler(async(req,res)=>{

    const data = req.validatedData;

    const category=await createCategoryService(data);

    res.status(201).json(

        new ApiResponse(

            201,

            category,

            "Category created successfully"

        )

    );

});

export const getCategories=asyncHandler(async(req,res)=>{

    const page=Number(req.query.page)||1;

    const limit=Number(req.query.limit)||10;

    const search=req.query.search||"";

    const result=await getCategoriesService(

        page,

        limit,

        search

    );

    res.json(

        new ApiResponse(

            200,

            result

        )

    );

});

export const getCategoryById=asyncHandler(async(req,res)=>{

    const category=await getCategoryByIdService(

        Number(req.params.id)

    );

    res.json(

        new ApiResponse(

            200,

            category

        )

    );

});

export const updateCategory=asyncHandler(async(req,res)=>{

    const data=categorySchema.parse(req.body);

    const category=await updateCategoryService(

        Number(req.params.id),

        data

    );

    res.json(

        new ApiResponse(

            200,

            category,

            "Category updated"

        )

    );

});

export const deleteCategory=asyncHandler(async(req,res)=>{

    await deleteCategoryService(

        Number(req.params.id)

    );

    res.json(

        new ApiResponse(

            200,

            null,

            "Category deleted"

        )

    );

});