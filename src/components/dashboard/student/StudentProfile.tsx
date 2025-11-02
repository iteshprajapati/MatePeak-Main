import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Bell,
  Shield,
  CreditCard,
  Trash2,
  Save,
  Upload,
  Calendar,
  Camera,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ImageEditor from '@/components/onboarding/ImageEditor';

interface StudentProfileProps {
  studentProfile: any;
  onProfileUpdate?: (updatedProfile: any) => void;
}

export default function StudentProfile({ studentProfile, onProfileUpdate }: StudentProfileProps) {
  const [profile, setProfile] = useState<any>(studentProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    occupation: '',
    bio: '',
    learning_goals: '',
    interests: [] as string[],
  });
  const [notifications, setNotifications] = useState({
    email_sessions: true,
    email_messages: true,
    email_reminders: true,
    email_marketing: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get student profile
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const profileData = data || {
        id: user.id,
        email: user.email,
      };

      setProfile(profileData);
      setProfilePictureUrl(profileData.profile_picture_url || '');
      setFormData({
        full_name: profileData.full_name || '',
        email: profileData.email || user.email || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        occupation: profileData.occupation || '',
        bio: profileData.bio || '',
        learning_goals: profileData.learning_goals || '',
        interests: profileData.interests || [],
      });

      // Get notification preferences (you may need to create this table)
      // For now, using default values

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG or PNG file');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Open image editor
    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setEditorOpen(true);
  };

  const handleSaveEditedImage = async (editedBlob: Blob) => {
    setUploading(true);
    setPreviewUrl(URL.createObjectURL(editedBlob));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload a profile picture');
        return;
      }

      const fileName = `${user.id}/profile-picture.jpg`;

      // Delete old profile picture if exists
      await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, editedBlob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Add cache-busting parameter to force refresh
      const publicUrlWithCache = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new picture URL
      const { data, error: updateError } = await supabase
        .from('student_profiles')
        .update({ 
          profile_picture_url: publicUrlWithCache,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfilePictureUrl(publicUrlWithCache);
      toast.success('Profile picture updated successfully!');
      
      // Call onProfileUpdate if provided
      if (onProfileUpdate) {
        onProfileUpdate(data);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload profile picture');
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('student_profiles')
        .upsert({
          id: user.id,
          ...formData,
          profile_picture_url: profilePictureUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Profile updated successfully!');
      fetchProfile();
      
      // Call onProfileUpdate if provided
      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, ...formData, profile_picture_url: profilePictureUrl });
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data including bookings and reviews. Are you absolutely sure?')) {
      return;
    }

    try {
      // TODO: Implement account deletion logic
      // This should handle:
      // 1. Cancel all upcoming bookings
      // 2. Delete user data
      // 3. Sign out and redirect
      toast.error('Account deletion is not yet implemented. Please contact support.');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const addInterest = (interest: string) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-40 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar 
                  className="h-32 w-32 cursor-pointer border-4 border-white shadow-lg hover:shadow-xl transition-all ring-4 ring-gray-100"
                  onClick={handleProfilePictureClick}
                >
                  <AvatarImage src={previewUrl || profilePictureUrl} alt="Profile picture" />
                  <AvatarFallback 
                    className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 text-2xl font-bold cursor-pointer"
                    onClick={handleProfilePictureClick}
                  >
                    {uploading ? (
                      <Loader2 className="h-12 w-12 animate-spin" />
                    ) : (
                      <Camera className="h-12 w-12" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {(profilePictureUrl || previewUrl) && !uploading && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div 
                  className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={handleProfilePictureClick}
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <Button
                type="button"
                onClick={handleProfilePictureClick}
                disabled={uploading}
                variant="outline"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {profilePictureUrl ? 'Change Photo' : 'Upload Photo'}
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center max-w-[200px]">
                JPG or PNG | Max 5MB
              </p>
            </div>

            {/* Image Editor Modal */}
            <ImageEditor
              open={editorOpen}
              onClose={() => setEditorOpen(false)}
              imageUrl={tempImageUrl}
              onSave={handleSaveEditedImage}
            />

            {/* Guidelines */}
            <div className="flex-1 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Photo Guidelines
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Clear, well-lit photo showing your face</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Professional or smart casual attire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Neutral background preferred</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Friendly, approachable expression</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="New York, USA"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="occupation">Occupation/Role</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="Software Engineer, Student, etc."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell mentors a bit about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="learning_goals">Learning Goals</Label>
              <Textarea
                id="learning_goals"
                value={formData.learning_goals}
                onChange={(e) => setFormData({ ...formData, learning_goals: e.target.value })}
                placeholder="What do you want to learn or achieve?"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interests & Topics</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.interests.map((interest, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {interest}
                  <button
                    onClick={() => removeInterest(interest)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add an interest (e.g., Python, Web Design)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addInterest((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  addInterest(input.value);
                  input.value = '';
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="w-full md:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_sessions">Session Notifications</Label>
              <p className="text-sm text-gray-500">
                Get notified about session confirmations and updates
              </p>
            </div>
            <Switch
              id="email_sessions"
              checked={notifications.email_sessions}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, email_sessions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_messages">Message Notifications</Label>
              <p className="text-sm text-gray-500">
                Get notified when mentors send you messages
              </p>
            </div>
            <Switch
              id="email_messages"
              checked={notifications.email_messages}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, email_messages: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_reminders">Session Reminders</Label>
              <p className="text-sm text-gray-500">
                Get reminded before your sessions start
              </p>
            </div>
            <Switch
              id="email_reminders"
              checked={notifications.email_reminders}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, email_reminders: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_marketing">Marketing Emails</Label>
              <p className="text-sm text-gray-500">
                Receive tips, updates, and promotional content
              </p>
            </div>
            <Switch
              id="email_marketing"
              checked={notifications.email_marketing}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, email_marketing: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label>Password</Label>
              <p className="text-sm text-gray-500">Last changed 3 months ago</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Not enabled</p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label>Active Sessions</Label>
              <p className="text-sm text-gray-500">Manage your active devices</p>
            </div>
            <Button variant="outline" size="sm">
              View Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No payment methods added</p>
            <Button variant="outline">Add Payment Method</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. This will:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside mb-4 space-y-1">
              <li>Cancel all upcoming sessions</li>
              <li>Delete all your data including reviews and messages</li>
              <li>Remove your profile permanently</li>
            </ul>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="w-full md:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
