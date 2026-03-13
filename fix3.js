const fs = require('fs');
let content = fs.readFileSync('backend/controllers/userController.js', 'utf8');
if (!content.includes('followUser')) {
  let addText = `\nexports.followUser = asyncHandler(async (req, res) => {\n  const userToFollowId = req.params.id;\n  const currentUserId = req.user._id;\n\n  if (String(userToFollowId) === String(currentUserId)) {\n    return res.status(400).json({ message: 'You cannot follow yourself' });\n  }\n\n  await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userToFollowId } });\n  await User.findByIdAndUpdate(userToFollowId, { $addToSet: { followers: currentUserId } });\n\n  res.json({ message: 'Successfully followed user' });\n});\n\nexports.unfollowUser = asyncHandler(async (req, res) => {\n  const userToUnfollowId = req.params.id;\n  const currentUserId = req.user._id;\n\n  await User.findByIdAndUpdate(currentUserId, { $pull: { following: userToUnfollowId } });\n  await User.findByIdAndUpdate(userToUnfollowId, { $pull: { followers: currentUserId } });\n\n  res.json({ message: 'Successfully unfollowed user' });\n});`;
  fs.writeFileSync('backend/controllers/userController.js', content + addText);
  console.log('Populated userController');
}

let routeContent = fs.readFileSync('backend/routes/userRoutes.js', 'utf8');
if (!routeContent.includes('/follow')) {
  let addRoutes = `\router.post('/:id/follow', requireAuth, userController.followUser);\nrouter.delete('/:id/follow', requireAuth, userController.unfollowUser);\n\nrouter.put`;
  routeContent = routeContent.replace('router.put', addRoutes);
  fs.writeFileSync('backend/routes/userRoutes.js', routeContent);
  console.log('Appended routes');
}