import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Calendar,
  MessageSquare,
  Tag,
  ChevronDown,
  Loader2,
  Save,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDistanceToNow } from "date-fns";

interface Student {
  student_id: string;
  student_name: string;
  student_email: string;
  first_session: string;
  last_session: string;
  total_sessions: number;
  completed_sessions: number;
  upcoming_sessions: number;
  notes?: string;
  tags?: string[];
}

interface StudentDirectoryProps {
  mentorProfile: any;
}

const StudentDirectory = ({ mentorProfile }: StudentDirectoryProps) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [mentorProfile]);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      // Fetch all bookings for this mentor
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("expert_id", mentorProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get unique user_ids from bookings
      const userIds = bookings
        ?.map((b) => b.user_id)
        .filter((id, idx, arr) => id && arr.indexOf(id) === idx) || [];

      // Fetch student profiles for these user_ids
      const { data: studentsData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      // Group bookings by student
      const studentMap = new Map<string, Student>();

      bookings?.forEach((booking) => {
        const studentId = booking.user_id || booking.student_email;
        const studentProfile = studentsData?.find((s) => s.id === booking.user_id);
        
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            student_id: studentId,
            student_name: studentProfile?.full_name || booking.student_name || "Anonymous",
            student_email: studentProfile?.email || booking.student_email || "",
            first_session: booking.scheduled_date,
            last_session: booking.scheduled_date,
            total_sessions: 0,
            completed_sessions: 0,
            upcoming_sessions: 0,
            notes: "",
            tags: [],
          });
        }

        const student = studentMap.get(studentId)!;
        student.total_sessions++;

        if (booking.status === "completed") {
          student.completed_sessions++;
        }

        const sessionDate = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);
        const now = new Date();

        if (sessionDate > now && booking.status === "confirmed") {
          student.upcoming_sessions++;
        }

        // Update first and last session dates
        if (booking.scheduled_date < student.first_session) {
          student.first_session = booking.scheduled_date;
        }
        if (booking.scheduled_date > student.last_session) {
          student.last_session = booking.scheduled_date;
        }
      });

      // Fetch notes from student_notes table
      const { data: notesData } = await supabase
        .from("student_notes")
        .select("*")
        .eq("expert_id", mentorProfile.id);

      notesData?.forEach((note) => {
        if (studentMap.has(note.student_id)) {
          const student = studentMap.get(note.student_id)!;
          student.notes = note.notes;
          student.tags = note.tags || [];
        }
      });

      setStudents(Array.from(studentMap.values()));
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (studentId: string) => {
    try {
      setSavingNotes(true);

      const { error } = await supabase
        .from("student_notes")
        .upsert({
          expert_id: mentorProfile.id,
          student_id: studentId,
          notes: notesText.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notes saved successfully",
      });

      setEditingNotes(null);
      fetchStudents();
    } catch (error: any) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.student_name.toLowerCase().includes(query) ||
      student.student_email.toLowerCase().includes(query)
    );
  });

  const getStudentInitials = (name: string) => {
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-600 mt-1">
            Manage your students and track their progress
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-100 border-0 rounded-2xl shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {students.length}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
              </div>
              <Users className="h-6 w-6 text-rose-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 border-0 rounded-2xl shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {students.filter((s) => s.upcoming_sessions > 0).length}
                </p>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Students
                  </p>
                  <p className="text-xs text-gray-500 mt-1">With upcoming sessions</p>
                </div>
              </div>
              <Activity className="h-6 w-6 text-rose-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100 border-0 rounded-2xl shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {students.reduce((sum, s) => sum + s.total_sessions, 0)}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Total Sessions
                </p>
              </div>
              <Calendar className="h-6 w-6 text-rose-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        <Input
          placeholder="Search students by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border border-gray-200 rounded-2xl"
        />
      </div>

      {/* Students List - 2 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gray-100 border-0 rounded-2xl">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Collapsible
              key={student.student_id}
              open={expandedStudent === student.student_id}
              onOpenChange={(open) =>
                setExpandedStudent(open ? student.student_id : null)
              }
            >
              <Card className="bg-gray-100 border-0 rounded-2xl hover:shadow-md transition-shadow group">
                <CollapsibleTrigger className="w-full">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white">
                              {getStudentInitials(student.student_name)}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="text-left min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {student.student_name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {student.student_email}
                            </p>
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ml-2 group-hover:text-gray-600 ${
                            expandedStudent === student.student_id
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-medium text-gray-600 bg-white rounded-md px-2.5 py-1">
                          {student.total_sessions} session{student.total_sessions !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs font-medium text-gray-600 bg-white rounded-md px-2.5 py-1">
                          {student.completed_sessions} completed
                        </span>
                        {student.upcoming_sessions > 0 && (
                          <span className="text-xs font-medium text-green-700 bg-green-50 rounded-md px-2.5 py-1">
                            {student.upcoming_sessions} upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
                    {/* Session Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-2xl font-bold text-gray-900">
                          {student.total_sessions}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Total</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-2xl font-bold text-blue-600">
                          {student.completed_sessions}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-2xl font-bold text-green-600">
                          {student.upcoming_sessions}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Upcoming</p>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Private Notes
                        </h4>
                        {editingNotes !== student.student_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingNotes(student.student_id);
                              setNotesText(student.notes || "");
                            }}
                          >
                            Edit Notes
                          </Button>
                        )}
                      </div>

                      {editingNotes === student.student_id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Add private notes about this student..."
                            rows={4}
                            className="resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNotes(student.student_id)}
                              disabled={savingNotes}
                              className="bg-gray-900 hover:bg-gray-800"
                            >
                              {savingNotes ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Notes
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingNotes(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : student.notes ? (
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {student.notes}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No notes yet. Click "Edit Notes" to add some.
                        </p>
                      )}
                    </div>

                    {/* Session History */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Session History
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          First session:{" "}
                          {new Date(student.first_session).toLocaleDateString()}
                        </p>
                        <p>
                          Last session:{" "}
                          {new Date(student.last_session).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        ) : (
          <Card className="bg-gray-100 border-0 rounded-2xl md:col-span-2">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900">
                {searchQuery ? "No students found" : "No students yet"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Students will appear here after they book sessions"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDirectory;
