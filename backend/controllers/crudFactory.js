export const list = (Model, filter = {}) => async (_req, res, next) => {
  try {
    const items = await Model.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const create = (Model) => async (req, res, next) => {
  try {
    const newItem = await Model.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

export const update = (Model) => async (req, res, next) => {
  try {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const remove = (Model) => async (req, res, next) => {
  try {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
