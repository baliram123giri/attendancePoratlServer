const { StreamModel } = require("../../models/stream.model")
const { createStreamValidation } = require("./validation")

async function CreateStream(req, res) {
    try {
        await createStreamValidation.validateAsync(req.body)
        const { name } = req.body
        const isStream = await StreamModel.findOne({ name })
        if (isStream) return res.status(400).json({ message: `${name} already added!` })
        await StreamModel.create(req.body)
        return res.json({ message: `${name} added successfully...` })
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}
async function ListStream(req, res) {
    try {
        const streams = await StreamModel.find({}, { _id: 0, name: 1, id: "$_id", })
        return res.json(streams)
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

async function UpdateStream(req, res) {
    try {
        const { name } = req.body;
        await StreamModel.findByIdAndUpdate(req.params.id, { name });
        return res.json({ message: `Stream with ID ${req.params.id} updated successfully.` });
    } catch (error) {
        return res.status(500).json({ message: error?.message });
    }
}

async function DeleteStream(req, res) {
    try {
        const { id } = req.params;
        await StreamModel.findByIdAndDelete(id);
        return res.json({ message: `Stream with ID ${id} deleted successfully.` });
    } catch (error) {
        return res.status(500).json({ message: error?.message });
    }
}

async function GetSingleStream(req, res) {
    try {
        const { id } = req.params;
        // Fetch the stream by ID
        const stream = await StreamModel.findById(id);

        if (!stream) {
            return res.status(404).json({ message: `Stream with ID ${id} not found!` });
        }

        return res.json(stream);
    } catch (error) {
        return res.status(500).json({ message: error?.message });
    }
}

module.exports = { CreateStream, ListStream, UpdateStream, DeleteStream, GetSingleStream }