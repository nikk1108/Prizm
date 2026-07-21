import Post from '../models/Post.js';
import User from '../models/User.js';
import Field from '../models/Field.js';
import Research from '../models/Research.js';
import Resource from '../models/Resource.js';
import Project from '../models/Project.js';
import Event from '../models/Event.js';
import Job from '../models/Job.js';

export const searchPosts = async (query, filters = {}, pagination = { page: 1, limit: 10 }) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const mongoQuery = { status: 'published' };

  if (query) {
    mongoQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ];
  }

  // Merge other filters (e.g. type, field)
  if (filters.type) mongoQuery.type = filters.type;
  if (filters.field) mongoQuery.field = filters.field;
  if (filters.visibility) mongoQuery.visibility = filters.visibility;

  const posts = await Post.find(mongoQuery)
    .populate('author', 'name profilePicture reputation verificationBadge')
    .populate('field', 'name slug')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Post.countDocuments(mongoQuery);

  return { items: posts, total, page, pages: Math.ceil(total / limit) };
};

export const searchUsers = async (query, filters = {}, pagination = { page: 1, limit: 10 }) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const mongoQuery = { status: 'active' };

  if (query) {
    mongoQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
      { skills: { $regex: query, $options: 'i' } }
    ];
  }

  if (filters.role) mongoQuery.role = filters.role;

  const users = await User.find(mongoQuery)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ reputation: -1 });

  const total = await User.countDocuments(mongoQuery);

  return { items: users, total, page, pages: Math.ceil(total / limit) };
};

export const searchFields = async (query, filters = {}, pagination = { page: 1, limit: 10 }) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const mongoQuery = {};

  if (query) {
    mongoQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }

  const fields = await Field.find(mongoQuery)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

  const total = await Field.countDocuments(mongoQuery);

  return { items: fields, total, page, pages: Math.ceil(total / limit) };
};

export const searchEverything = async (query, filters = {}, pagination = { page: 1, limit: 5 }) => {
  const [posts, users, fields] = await Promise.all([
    searchPosts(query, filters, { page: 1, limit: pagination.limit }),
    searchUsers(query, filters, { page: 1, limit: pagination.limit }),
    searchFields(query, filters, { page: 1, limit: pagination.limit })
  ]);

  return {
    posts: posts.items,
    users: users.items,
    fields: fields.items
  };
};
