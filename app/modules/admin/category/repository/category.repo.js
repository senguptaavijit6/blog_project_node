const CategoryModel = require("../model/category.model")

class CategoryRepo {
    //create
    async createCategory(category) {
        try {
            return await CategoryModel.create(category)
        } catch (error) {
            console.log("error in CategoryRepo -> createCategory", error);
        }
    }
    //retrieve
    async retrieveAllCategories() {
        try {
            const categoryData =  await CategoryModel.find({isDeleted: false, status: "active"})
            categoryData.activeCount = await CategoryModel.countDocuments({ isDeleted: false, status: "active" })
            categoryData.inactiveCount = await CategoryModel.countDocuments({ isDeleted: false, status: "inactive" })
            return categoryData
        } catch (error) {
            console.log("error in CategoryRepo -> retrieveAllCategories", error);
        }
    }
    //retrieve all categories with Pagination
    async retrieveAllCategoriesWithPagination(skip, limit) {
        try {
            const categoryData =  await CategoryModel.find({isDeleted: false, status: "active"}).limit(limit).skip(skip)
            const totalCount = await CategoryModel.countDocuments({ isDeleted: false, status: "active" })
            return {categoryData, totalCount}
        } catch (error) {
            console.log("error in CategoryRepo -> retrieveAllCategoriesWithPagination", error);
        }
    }
    //retrieve single category
    async retrieveSingleCategory(id) {
        try {
            return await CategoryModel.findOne({_id: id, isDeleted: false})
        } catch (error) {
            console.log("error in CategoryRepo -> retrieveSingleCategory", error);
        }
    }

    // retrieve categories for search
    async retrieveCategoriesForSearchWithPagination(searchKeywords, skip, limit) {
        try {
            const categoryData = await CategoryModel.find({isDeleted: false, status: "active", name: {$regex: searchKeywords, $options: 'i'}}, { name: 1, _id: 1 }).limit(limit).skip(skip)
            return categoryData
        } catch (error) {
            console.log("error in CategoryRepo -> retrieveCategoriesForSearch", error);
        }
    }

    // retrieve categories for search with pagination and count
    async getCategoriesByIds(categoryIds) {
        try {
            const category = {}
            category.data =  await CategoryModel.find({_id: {$in: categoryIds}, isDeleted: false, status: "active"})
            category.totalCount = await CategoryModel.countDocuments({ isDeleted: false, status: "active" })
            return category
        } catch (error) {
            console.log("error in CategoryRepo -> getCategoriesByIds", error);
        }
    }
    

    // check if the category exists
    async checkCategoryExistance(categoryName) {
        try {
            const isCategoryExists = await CategoryModel.findOne({ name: categoryName, isDeleted: false })
            if (isCategoryExists) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.log("error in CategoryRepo -> checkCategoryExistance", error);
        }
    }

    //check category existance at the time of edit/update category
    async checkCategoryExistanceById(id, categoryName) {
        try {
            const isCategoryExists = await CategoryModel.findOne({ _id: {$ne: id}, name: categoryName, isDeleted: false })
            
            if (isCategoryExists) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.log("error in CategoryRepo -> checkCategoryExistanceById", error);
        }
    }

    //update
    async updateCategory(id, updateData) {
        try {
            console.log("updateData from repo -> updateCategory", updateData);
            
            return await CategoryModel.findByIdAndUpdate(id, updateData)
        } catch (error) {
            console.log("error in CategoryRepo -> updateCategory", error);
        }
    }
    //delete
    async deleteCategory(id) {
        try {
            return await CategoryModel.findByIdAndUpdate(id, {isDeleted: true})
        } catch (error) {
            console.log("error in CategoryRepo -> updateCategory", error);
        }
    }
}

module.exports = new CategoryRepo