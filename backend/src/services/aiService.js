import Post from '../models/Post.js';
import Research from '../models/Research.js';

export const summarizePost = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Post not found');

  return {
    summary: `### Core Insight Summary\nThis post titled **"${post.title}"** outlines critical technical principles. It highlights implementation workflows and discusses optimization practices.\n\n### Key Takeaways\n1. Establishes clean separation of concerns.\n2. Minimizes database queries using relational caching.\n3. Maximizes UI latency benefits by implementing optimistic state updates.`,
    wordCount: 52,
    modelUsed: 'gemini-3.5-flash-mock'
  };
};

export const summarizeResearch = async (researchId) => {
  const research = await Research.findById(researchId);
  if (!research) throw new Error('Research not found');

  return {
    summary: `### Academic Research Summary\n- **Objective**: Evaluates scalability vectors in decentralized database networks.\n- **Methodology**: Quantitative latency simulation under a 10,000-node network distribution.\n- **Key Finding**: Caching nodes utilizing LRU structures reduced mean read query response time from 145ms to 12ms under heavy load.\n- **Significance**: Proves feasibility of real-time peer-to-peer data indexing without full consensus synchronization.`,
    doi: research.doi,
    modelUsed: 'gemini-3.5-flash-mock'
  };
};

export const explainTopic = async (topicTitle) => {
  return {
    topic: topicTitle,
    explanation: `### Understanding ${topicTitle}\n\n**${topicTitle}** is a core computer science and engineering concept. Here's a brief breakdown:\n\n1. **What is it?**: A structured methodology that helps organize computational flows efficiently.\n2. **Why it matters**: It provides algorithmic guarantees for space and time complexities.\n3. **Typical Use Cases**: Systems engineering, database caching strategies, and large-scale web services orchestration.`,
    modelUsed: 'gemini-3.5-flash-mock'
  };
};

export const recommendPosts = async (userId) => {
  // Query top-rated and featured posts as recommendation fallback
  const posts = await Post.find({ status: 'published', visibility: 'public' })
    .limit(5)
    .populate('author', 'name profilePicture reputation verificationBadge')
    .populate('field', 'name slug');

  return posts;
};

export const semanticSearch = async (vectorQuery) => {
  // Fallback to text searches
  const posts = await Post.find({
    status: 'published',
    $or: [
      { title: { $regex: vectorQuery, $options: 'i' } },
      { content: { $regex: vectorQuery, $options: 'i' } }
    ]
  })
    .limit(5)
    .populate('author', 'name profilePicture reputation');

  return posts;
};
