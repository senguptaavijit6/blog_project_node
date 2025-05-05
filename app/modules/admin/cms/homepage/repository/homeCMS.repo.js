const HomepageCMSModel = require("../model/homepageCMS.model");
const HomeSliderModel = require("../model/homeSlider.model");

class HomepageCMSRepo {
    //create homepage content other than Slider
    async create(about) {
        try {
            return await HomepageCMSModel.create(about)
        } catch (error) {
            console.log("error in HomepageCMSRepo -> create", error);
        }
    }

    //create slider content
    async createSlider(content) {
        try {
            return await HomeSliderModel.create(content)
        } catch (error) {
            console.log("error in HomepageCMSRepo -> createSlider", error);
        }
    }

    //retrieve
    async retrieve() {
        try {
            return await HomepageCMSModel.findOne({ isDeleted: false })
        } catch (error) {
            console.log("error in HomepageCMSRepo -> retrieve", error);
        }
    }

    // retrive slider 
    async retrieveSlider(parameter) {
        try {
            const sliderData = await HomeSliderModel.find(parameter)
            sliderData.activeCount = await HomeSliderModel.countDocuments({ status: "active" })
            sliderData.inactiveCount = await HomeSliderModel.countDocuments({ status: "inactive" })
            return sliderData
        } catch (error) {
            console.log("error in HomepageCMSRepo -> retrieveSlider", error);
        }
    }

    // retrive single slider 
    async retrieveSingleSlider(id) {
        try {
            return await HomeSliderModel.findById(id)
        } catch (error) {
            console.log("error in HomepageCMSRepo -> retrieveSlider", error);
        }
    }

    //update
    async update(id, updateData) {
        try {
            return await HomepageCMSModel.findOneAndUpdate({_id: id, isDeleted: false}, updateData)
        } catch (error) {
            console.log("error in HomepageCMSRepo -> update", error);
        }
    }

    // update Slider
    async updateSlider(id, updateData) {
        try {
            return await HomeSliderModel.findOneAndUpdate({ _id: id }, updateData)
        } catch (error) {
            console.log("error in HomepageCMSRepo -> updateSlider", error);
        }
    }

    // soft-delete
    async delete(id) {
        try {
            return await HomepageCMSModel.findOneAndUpdate({_id: id}, { isDeleted: true })
        } catch (error) {
            console.log("error in HomepageCMSRepo -> delete", error);
        }
    }

    //soft-delete slider 
    async deleteSlider(id) {
        try {
            return await HomeSliderModel.findOneAndUpdate({ _id: id }, {isDeleted: true})
        } catch (error) {
            console.log("error in HomepageCMSRepo -> deleteSlider", error);
        }
    }
}

module.exports = new HomepageCMSRepo