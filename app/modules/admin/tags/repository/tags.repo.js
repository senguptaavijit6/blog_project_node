const TagModel = require("../model/tags.model")

class TagRepo {
    //create
    async createTag(Tag) {
        try {
            return await TagModel.create(Tag)
        } catch (error) {
            console.log("error in TagRepo -> createTag", error);
        }
    }
    //retrieve
    async retrieveAllTags() {
        try {
            const TagsData =  await TagModel.find({isDeleted: false})
            TagsData.activeCount = await TagModel.countDocuments({ isDeleted: false, status: "active" })
            TagsData.inactiveCount = await TagModel.countDocuments({ isDeleted: false, status: "inactive" })
            return TagsData
        } catch (error) {
            console.log("error in TagRepo -> retrieveAllTags", error);
        }
    }
    //retrieve all tags with Pagination
    async retrieveAllTagsWithPagination(skip, limit) {
        try {
            const TagsData =  await TagModel.find({isDeleted: false, status: "active"}).limit(limit).skip(skip)
            const totalCount = await TagModel.countDocuments({ isDeleted: false, status: "active" })
            return {TagsData, totalCount}
        } catch (error) {
            console.log("error in TagRepo -> retrieveAllTagsWithPagination", error);
        }
    }
    //retrieve tags for search with Pagination
    async retrieveTagsForSearchWithPagination(searchKeywords, skip, limit) {
        try {
            const TagsData = await TagModel.find({isDeleted: false, status: "active", name: {$regex: searchKeywords, $options: 'i'}}, { name: 1, _id: 1 }).limit(limit).skip(skip)
            return TagsData
        } catch (error) {
            console.log("error in TagRepo -> retrieveTagsForSearchWithPagination", error);
        }
    }
    //retrieve single Tag
    async retrieveSingleTag(id) {
        try {
            return await TagModel.findOne({_id: id, isDeleted: false})
        } catch (error) {
            console.log("error in TagRepo -> retrieveSingleTag", error);
        }
    }

    // retrieve tags for search with pagination and count
    async getTagsByIds(tagIds) {
        try {
            const tag = {}
            tag.data =  await TagModel.find({_id: {$in: tagIds}, isDeleted: false, status: "active"})
            tag.totalCount = await TagModel.countDocuments({ isDeleted: false, status: "active" })
            return tag
        } catch (error) {
            console.log("error in TagRepo -> getTagsByIds", error);
        }
    }


    // check if the Tag exists
    async checkTagExistance(TagName) {
        try {
            const isTagExists = await TagModel.findOne({ name: TagName, isDeleted: false })
            if (isTagExists) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.log("error in TagRepo -> checkTagExistance", error);
        }
    }

    //check Tag existance at the time of edit/update Tag
    async checkTagExistanceById(id, TagName) {
        try {
            const isTagExists = await TagModel.findOne({ _id: {$ne: id}, name: TagName, isDeleted: false })
            
            if (isTagExists) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.log("error in TagRepo -> checkTagExistanceById", error);
        }
    }

    //update
    async updateTag(id, updateData) {
        try {
            console.log("updateData from repo -> updateTag", updateData);
            
            return await TagModel.findByIdAndUpdate(id, updateData)
        } catch (error) {
            console.log("error in TagRepo -> updateTag", error);
        }
    }
    //delete
    async deleteTag(id) {
        try {
            return await TagModel.findByIdAndUpdate(id, {isDeleted: true})
        } catch (error) {
            console.log("error in TagRepo -> updateTag", error);
        }
    }
}

module.exports = new TagRepo