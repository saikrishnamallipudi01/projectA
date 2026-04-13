const Category = require('../models/Category');
const Service = require('../models/Service');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1 });

        // Attach real service counts to each category
        const catsWithCount = await Promise.all(
            categories.map(async (cat) => {
                const count = await Service.countDocuments({
                    categoryId: cat._id,
                    isActive: { $ne: false }
                });
                const obj = cat.toObject();
                obj.serviceCount = count;
                return obj;
            })
        );

        res.json(catsWithCount);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        let category;
        const { id } = req.params;
        
        // Try finding by custom id (slug) first, then by MongoDB _id
        category = await Category.findOne({ id });
        if (!category && id.match(/^[0-9a-fA-F]{24}$/)) {
            category = await Category.findById(id);
        }

        if (!category) return res.status(404).json({ message: 'Category not found' });

        const services = await Service.find({ categoryId: category._id });
        res.json({ category, services });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        console.log('[Category Controller] Creating category. Body:', req.body);
        console.log('[Category Controller] File:', req.file);
        const categoryData = { ...req.body };
        if (req.file) {
            categoryData.image = `/uploads/categories/${req.file.filename}`;
            console.log('[Category Controller] Image set to:', categoryData.image);
        }
        const category = new Category(categoryData);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        console.error('[Category Controller] Create Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = `/uploads/categories/${req.file.filename}`;
        }
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        res.json(updatedCategory);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
