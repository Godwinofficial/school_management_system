import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuthService } from "@/lib/auth";
import { StorageService, School, Student } from "@/lib/storage";
import { School as SchoolIcon, Search, Filter, MapPin, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");

  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();
  const navigate = useNavigate();

  useEffect(() => {
    const allSchools = StorageService.getSchools();
    // Filter schools based on user level
    let filteredByLevel = allSchools;

    if (userLevel === 'district' && user?.district) {
      filteredByLevel = allSchools.filter(school => school.district === user.district);
    } else if (userLevel === 'provincial' && user?.province) {
      filteredByLevel = allSchools.filter(school => school.province === user.province);
    }

    setSchools(filteredByLevel);
    setFilteredSchools(filteredByLevel);
  }, [user, userLevel]);

  useEffect(() => {
    let filtered = schools.filter(school => {
      const matchesSearch =
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.centerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.district.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || school.type === typeFilter;
      const matchesDistrict = districtFilter === "all" || school.district === districtFilter;

      return matchesSearch && matchesType && matchesDistrict;
    });

    setFilteredSchools(filtered);
  }, [schools, searchTerm, typeFilter, districtFilter]);

  const getSchoolStudents = (schoolId: string): Student[] => {
    return StorageService.getStudents(schoolId);
  };

  const getCapacityStatus = (school: School) => {
    const utilization = (school.totalEnrolment / school.standardCapacity) * 100;
    if (utilization > 100) return { status: 'overcapacity', color: 'destructive' };
    if (utilization > 90) return { status: 'near capacity', color: 'warning' };
    if (utilization > 70) return { status: 'good', color: 'default' };
    return { status: 'under capacity', color: 'secondary' };
  };

  const getUniqueDistricts = () => {
    return [...new Set(schools.map(school => school.district))].sort();
  };

  const schoolTypes = ['GRZ', 'Grant Aided', 'Private'];
  const districts = getUniqueDistricts();

  const totalCapacity = schools.reduce((sum, school) => sum + school.standardCapacity, 0);
  const totalEnrollment = schools.reduce((sum, school) => sum + school.totalEnrolment, 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((totalEnrollment / totalCapacity) * 100) : 0;

  const schoolStats = {
    total: schools.length,
    grz: schools.filter(s => s.type === 'GRZ').length,
    grantAided: schools.filter(s => s.type === 'Grant Aided').length,
    private: schools.filter(s => s.type === 'Private').length,
    overcapacity: schools.filter(s => (s.totalEnrolment / s.standardCapacity) > 1).length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Schools Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive overview and management of educational institutions
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {filteredSchools.length} Schools
        </Badge>
      </div>

      {/* Overview Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <SchoolIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {schoolStats.grz} GRZ • {schoolStats.grantAided} Grant Aided • {schoolStats.private} Private
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Standard enrollment capacity</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Enrollment</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollment.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Students currently enrolled</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${avgUtilization > 90 ? 'text-destructive' : 'text-primary'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              {schoolStats.overcapacity} schools over capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {schoolTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setDistrictFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SchoolIcon className="h-5 w-5" />
            Schools Directory
          </CardTitle>
          <CardDescription>
            Detailed information about all educational institutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => {
                  const utilization = Math.round((school.totalEnrolment / school.standardCapacity) * 100);
                  const capacityStatus = getCapacityStatus(school);
                  const students = getSchoolStudents(school.id);

                  return (
                    <TableRow key={school.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{school.name}</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {school.centerNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            school.type === 'GRZ' ? 'default' :
                              school.type === 'Grant Aided' ? 'secondary' :
                                'outline'
                          }
                        >
                          {school.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <div className="text-sm">
                            <div>{school.district}</div>
                            <div className="text-muted-foreground">{school.province}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{school.standardCapacity.toLocaleString()}</div>
                          <div className="text-muted-foreground">capacity</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{school.totalEnrolment.toLocaleString()}</div>
                          <div className="text-muted-foreground">{students.length} active</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{utilization}%</div>
                          <Progress value={utilization} className="h-1 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={capacityStatus.color as any}>
                          {capacityStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/schools/${school.id}`)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* School Performance Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Capacity Analysis</CardTitle>
            <CardDescription>School capacity utilization breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Under Capacity (<70%)', count: schools.filter(s => (s.totalEnrolment / s.standardCapacity) < 0.7).length, color: 'bg-muted' },
              { label: 'Good Utilization (70-90%)', count: schools.filter(s => (s.totalEnrolment / s.standardCapacity) >= 0.7 && (s.totalEnrolment / s.standardCapacity) <= 0.9).length, color: 'bg-success' },
              { label: 'Near Capacity (90-100%)', count: schools.filter(s => (s.totalEnrolment / s.standardCapacity) > 0.9 && (s.totalEnrolment / s.standardCapacity) <= 1).length, color: 'bg-warning' },
              { label: 'Over Capacity (>100%)', count: schools.filter(s => (s.totalEnrolment / s.standardCapacity) > 1).length, color: 'bg-destructive' }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.count} schools</span>
                </div>
                <Progress
                  value={schools.length > 0 ? (item.count / schools.length) * 100 : 0}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>School Type Distribution</CardTitle>
            <CardDescription>Schools by management type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { type: 'GRZ', count: schoolStats.grz, description: 'Government schools' },
              { type: 'Grant Aided', count: schoolStats.grantAided, description: 'Grant aided institutions' },
              { type: 'Private', count: schoolStats.private, description: 'Private schools' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">{item.type}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{item.count}</div>
                  <div className="text-xs text-muted-foreground">
                    {schools.length > 0 ? Math.round((item.count / schools.length) * 100) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>Schools distribution across districts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {districts.map(district => {
              const districtSchools = schools.filter(s => s.district === district);
              const districtCapacity = districtSchools.reduce((sum, s) => sum + s.standardCapacity, 0);
              const districtEnrollment = districtSchools.reduce((sum, s) => sum + s.totalEnrolment, 0);

              return (
                <Card key={district} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{district}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Schools:</span>
                      <span className="font-medium">{districtSchools.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capacity:</span>
                      <span className="font-medium">{districtCapacity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Enrollment:</span>
                      <span className="font-medium">{districtEnrollment.toLocaleString()}</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Utilization</span>
                        <span>{districtCapacity > 0 ? Math.round((districtEnrollment / districtCapacity) * 100) : 0}%</span>
                      </div>
                      <Progress
                        value={districtCapacity > 0 ? (districtEnrollment / districtCapacity) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}