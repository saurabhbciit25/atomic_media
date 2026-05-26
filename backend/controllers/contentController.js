import SiteContent from "../models/SiteContent.js";

export async function getContent(_req, res, next) {
  try {
    const rows = await SiteContent.find();
    res.json(rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}));
  } catch (error) {
    next(error);
  }
}

export async function getContentByKey(req, res, next) {
  try {
    const { key } = req.params;
    const row = await SiteContent.findOne({ key });
    res.json(row || { key, value: {} });
  } catch (error) {
    next(error);
  }
}

export async function upsertContent(req, res, next) {
  try {
    const updates = await Promise.all(
      Object.entries(req.body).map(([key, value]) =>
        SiteContent.findOneAndUpdate({ key }, { value }, { new: true, upsert: true })
      )
    );
    res.json(updates);
  } catch (error) {
    next(error);
  }
}

export async function upsertContentByKey(req, res, next) {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const row = await SiteContent.findOneAndUpdate({ key }, { value }, { new: true, upsert: true });
    res.json(row);
  } catch (error) {
    next(error);
  }
}
