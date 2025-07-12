import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Building2, 
  Megaphone, 
  TrendingUp, 
  Target,
  Mail,
  Phone,
  Plus,
  ArrowUpRight,
  Activity
} from "lucide-react"

const Dashboard = () => {
  const stats = [
    {
      title: "Total Contacts",
      value: "12,486",
      change: "+12%",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Companies",
      value: "2,847",
      change: "+8%",
      icon: Building2,
      color: "text-accent"
    },
    {
      title: "Active Campaigns",
      value: "24",
      change: "+15%",
      icon: Megaphone,
      color: "text-success"
    },
    {
      title: "Response Rate",
      value: "18.3%",
      change: "+2.4%",
      icon: TrendingUp,
      color: "text-warning"
    }
  ]

  const recentActivities = [
    { type: "contact", action: "New contact added", details: "Sarah Johnson from TechCorp", time: "2 hours ago" },
    { type: "campaign", action: "Campaign launched", details: "Q4 Product Launch Campaign", time: "4 hours ago" },
    { type: "company", action: "Company updated", details: "Microsoft - 15 new contacts", time: "6 hours ago" },
    { type: "contact", action: "Contact responded", details: "John Doe replied to email campaign", time: "8 hours ago" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your campaign management and lead generation performance
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Target className="w-4 h-4" />
            Create Audience
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="transition-all duration-200 hover:shadow-lg border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowUpRight className="w-3 h-3 text-success" />
                <span className="text-success font-medium">{stat.change}</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest updates from your campaigns and contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'contact' ? 'bg-primary' :
                    activity.type === 'campaign' ? 'bg-accent' :
                    'bg-success'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Users className="w-4 h-4" />
              Add New Contact
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Building2 className="w-4 h-4" />
              Add Company
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Mail className="w-4 h-4" />
              Send Email Campaign
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Phone className="w-4 h-4" />
              Schedule Call
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Target className="w-4 h-4" />
              Build Audience
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>
            Overview of your active campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">847</div>
              <div className="text-sm text-muted-foreground">Emails Sent</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-accent">156</div>
              <div className="text-sm text-muted-foreground">Responses</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-success">42</div>
              <div className="text-sm text-muted-foreground">New Leads</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard