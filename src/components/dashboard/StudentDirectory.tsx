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

      // Group bookings by student
      const studentMap = new Map<string, Student>();

      bookings?.forEach((booking) => {
        const studentId = booking.student_id || booking.student_email;
        
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            student_id: studentId,
            student_name: booking.student_name || "Anonymous",
            student_email: booking.student_email || "",
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
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Total Students
              </p>
              <div className="text-4xl font-bold text-gray-900">
                {students.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Active Students
              </p>
              <div className="text-4xl font-bold text-gray-900">
                {students.filter((s) => s.upcoming_sessions > 0).length}
              </div>
              <p className="text-sm text-gray-500 mt-1">With upcoming sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Total Sessions
              </p>
              <div className="text-4xl font-bold text-gray-900">
                {students.reduce((sum, s) => sum + s.total_sessions, 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
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
              <Card className="border-gray-200 hover:shadow-md transition-shadow">
                <CollapsibleTrigger className="w-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-700">
                            {getStudentInitials(student.student_name)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">
                            {student.student_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {student.student_email}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500">
                              {student.total_sessions} session
                              {student.total_sessions !== 1 ? "s" : ""}
                            </span>
                            <span className="text-xs text-gray-500">
                              Last:{" "}
                              {formatDistanceToNow(new Date(student.last_session), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4">
                        {student.upcoming_sessions > 0 && (
                          <Badge className="bg-green-100 text-green-800 border-0">
                            {student.upcoming_sessions} upcoming
                          </Badge>
                        )}
                        <Badge className="bg-blue-100 text-blue-800 border-0">
                          {student.completed_sessions} completed
                        </Badge>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            expandedStudent === student.student_id
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
                    {/* Session Stats */}
                    <div className="grid grid-cols-3 gap-4">
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
          <Card className="border-gray-200">
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
