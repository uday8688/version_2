import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Heart, 
  Plus,
  Filter,
  Search,
  ArrowLeft,
  Send,
  ShoppingBag,
  HelpCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  post_type: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_id: string;
  property_id: string;
  author?: {
    full_name: string;
  };
}

interface PostComment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  is_anonymous: boolean;
  author?: {
    full_name?: string;
  };
}

const CommunityHub = () => {
  useSEO('community');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // Form state for creating posts
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'general' as const,
    is_anonymous: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Manually fetch author data for each post
      const postsWithAuthors = await Promise.all((data || []).map(async (post) => {
        if (!post.is_anonymous) {
          const { data: author } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', post.author_id)
            .single();
          return { ...post, author };
        }
        return post;
      }));
      
      setPosts(postsWithAuthors);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Manually fetch author data for each comment
      const commentsWithAuthors = await Promise.all((data || []).map(async (comment) => {
        if (!comment.is_anonymous) {
          const { data: author } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', comment.author_id)
            .single();
          return { ...comment, author };
        }
        return comment;
      }));
      
      setComments(commentsWithAuthors);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's property
      const { data: lease } = await supabase
        .from('leases')
        .select('unit:units(property_id)')
        .eq('tenant_id', user.id)
        .eq('status', 'active')
        .single();

      const propertyId = lease?.unit?.property_id;
      if (!propertyId) {
        toast({
          title: "Error",
          description: "Unable to determine your property.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .insert({
          ...newPost,
          author_id: user.id,
          property_id: propertyId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      setShowCreateDialog(false);
      setNewPost({
        title: '',
        content: '',
        post_type: 'general',
        is_anonymous: false
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedPost || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: selectedPost.id,
          author_id: user.id,
          content: newComment.trim(),
          is_anonymous: false
        });

      if (error) throw error;

      // Update comments count
      await supabase
        .from('community_posts')
        .update({ comments_count: selectedPost.comments_count + 1 })
        .eq('id', selectedPost.id);

      setNewComment('');
      fetchComments(selectedPost.id);
      fetchPosts(); // Refresh posts to update comment count
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  const getPostTypeIcon = (type: string) => {
    const icons = {
      general: MessageSquare,
      buy_sell: ShoppingBag,
      help: HelpCircle,
      complaint: AlertTriangle,
      suggestion: Lightbulb
    };
    const IconComponent = icons[type as keyof typeof icons] || MessageSquare;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPostTypeBadge = (type: string) => {
    const variants = {
      general: 'bg-blue-100 text-blue-800',
      buy_sell: 'bg-green-100 text-green-800', 
      help: 'bg-orange-100 text-orange-800',
      complaint: 'bg-red-100 text-red-800',
      suggestion: 'bg-purple-100 text-purple-800'
    };
    return variants[type as keyof typeof variants] || variants.general;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = postTypeFilter === 'all' || post.post_type === postTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={ROUTES.TENANT} className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Community Hub</h1>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Community Post</DialogTitle>
                  <DialogDescription>
                    Share with your neighbors and community
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Post Type</label>
                    <Select value={newPost.post_type} onValueChange={(value: any) => setNewPost(prev => ({...prev, post_type: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Discussion</SelectItem>
                        <SelectItem value="buy_sell">Buy/Sell/Exchange</SelectItem>
                        <SelectItem value="help">Help Needed</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      required
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({...prev, title: e.target.value}))}
                      placeholder="What's on your mind?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <Textarea
                      required
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({...prev, content: e.target.value}))}
                      placeholder="Share your thoughts with the community..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={newPost.is_anonymous}
                      onChange={(e) => setNewPost(prev => ({...prev, is_anonymous: e.target.checked}))}
                      className="rounded"
                    />
                    <label htmlFor="anonymous" className="text-sm">Post anonymously</label>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Post</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={postTypeFilter} onValueChange={setPostTypeFilter}>
                  <SelectTrigger className="w-52">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="buy_sell">Buy/Sell</SelectItem>
                    <SelectItem value="help">Help</SelectItem>
                    <SelectItem value="complaint">Complaints</SelectItem>
                    <SelectItem value="suggestion">Suggestions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No posts found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to start a conversation!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getPostTypeBadge(post.post_type)}>
                            {getPostTypeIcon(post.post_type)}
                            <span className="ml-1 capitalize">{post.post_type.replace('_', ' ')}</span>
                          </Badge>
                          {post.is_anonymous && (
                            <Badge variant="outline">Anonymous</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {post.is_anonymous ? 'A' : (post.author?.full_name?.charAt(0) || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {post.is_anonymous ? 'Anonymous' : (post.author?.full_name || 'Unknown User')}
                          </span>
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{post.content}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes_count}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post);
                            fetchComments(post.id);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments_count}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              Community discussion
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">{selectedPost.content}</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <span>
                    {selectedPost.is_anonymous ? 'Anonymous' : (selectedPost.author?.full_name || 'Unknown User')}
                  </span>
                  <span>•</span>
                  <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Comments ({comments.length})</h4>
                
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-3 border rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comment.is_anonymous ? 'A' : (comment.author?.full_name?.charAt(0) || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium">
                          {comment.is_anonymous ? 'Anonymous' : (comment.author?.full_name || 'Unknown User')}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex space-x-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityHub;