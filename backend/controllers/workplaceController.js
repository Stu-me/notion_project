const Workspace = require("../models/workspaceModel");
const Page = require("../models/pageModel");
const Block = require("../models/blockModel");
const asyncHandler = require("express-async-handler");

//  here we have to work with database so we must have the model
// our task is to return all the workspaces and the frontend will see what to do

// @desc Get workspaces for the authenticated user
// @route GET /workspaces
// @access private
const getWorkspaces = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  // The dashboard fetches pages only for the selected workspace, so avoid loading every page here.
  const workspaces = await Workspace.find({ owner: ownerId });

  // workspaces is an ARRAY of workspace objects — arrays don't have .pages
  return res.status(200).json(workspaces);
});

// @desc Create a new workspace
// @route POST /workspaces
// @access private
const createWorkspaces = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    res.status(400);
    throw new Error("Workspace name is required");
  }

  // just create new workspace with name and assinged to an owner
  const workspace = await Workspace.create({
    name,
    owner: req.user._id,
  });
  res.status(201).json(workspace);
});

// @desc Update an existing workspace
// @route PUT /workspaces/:id
// @access private
const updateWorkspaces = asyncHandler(async (req, res) => {
  // for update we need to change the existing workspace
  // user will give us the id of the workspace as this is the only way to target correct one
  const id = req.params.id;

  const workspace = await Workspace.findById(id);
  // if no workspace found
  if (!workspace) {
    res.status(404);
    throw new Error("User not found ");
  }
  if (workspace.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Unauthorized access");
  }
  const name = req.body.name?.trim();
  if (!name) {
    res.status(400);
    throw new Error("Workspace name is required");
  }
  const updated = await Workspace.findByIdAndUpdate(
    id, //id for finiding
    { name }, // what to update - remember we cant update pages here
    { new: true }, // sends updated data to frontend
  );
  return res.status(200).json(updated);
});

// @desc Delete a workspace
// @route DELETE /workspaces/:id
// @access private
const deleteWorkspaces = asyncHandler(async(req, res) => {
    const id = req.params.id;
    const workspace = await Workspace.findById(id);
    if(!workspace){
      res.status(404);
      throw new Error("Workspace not found");
    }
    if(workspace.owner.toString() !== req.user._id.toString()){
      res.status(403);
      throw new Error("You dont have ownership access");
    }
    const pages = await Page.find({ workspace: id }).select("_id");
    const pageIds = pages.map((page) => page._id);

    await Block.deleteMany({ page: { $in: pageIds } });
    await Page.deleteMany({ workspace: id });
    await Workspace.findByIdAndDelete(id);

    return res.status(200).json({message:"workspace deleted successfully "})
})

module.exports = {
  getWorkspaces,
  createWorkspaces,
  updateWorkspaces,
  deleteWorkspaces,
};
