import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import slugify from "slugify";
export const createCategoryService = async (data) => {

  const slug = slugify(data.name, {
    lower: true,
    strict: true
  });

  const exists = await prisma.category.findFirst({
    where: {
      OR: [
        { name: data.name },
        { slug }
      ]
    }
  });

  if (exists) {
    throw new ApiError(400, "Category already exists");
  }

  return await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description
    }
  });

};

export const getCategoriesService = async (page,limit,search)=>{

    const skip=(page-1)*limit;

    const where={
        ...(search && {
            name:{
                contains:search,
                mode:"insensitive"
            }
        })
    };

    const total=await prisma.category.count({where});

    const categories=await prisma.category.findMany({

        where,

        skip,

        take:limit,

        orderBy:{
            createdAt:"desc"
        }

    });

    return{

        total,

        page,

        limit,

        categories

    };

};

export const getCategoryByIdService = async(id)=>{

    const category=await prisma.category.findUnique({

        where:{id}

    });

    if(!category){

        throw new ApiError(404,"Category not found");

    }

    return category;

};

export const updateCategoryService = async (id, data) => {

  await getCategoryByIdService(id);

  const slug = slugify(data.name, {
    lower: true,
    strict: true
  });

  return await prisma.category.update({
    where: {
      id
    },
    data: {
      name: data.name,
      slug,
      description: data.description
    }
  });

};

export const deleteCategoryService=async(id)=>{

    await getCategoryByIdService(id);

    await prisma.category.delete({

        where:{id}

    });

};