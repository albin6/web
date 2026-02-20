import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, PhoneCall, TrendingUp } from "lucide-react";

const statsCards = [
    {
        title: "Total Students",
        icon: Users,
        value: "—",
        description: "Enrolled students",
        color: "text-blue-500",
    },
    {
        title: "Active Tasks",
        icon: ClipboardList,
        value: "—",
        description: "In progress",
        color: "text-amber-500",
    },
    {
        title: "Follow-Ups",
        icon: PhoneCall,
        value: "—",
        description: "Pending contact",
        color: "text-green-500",
    },
    {
        title: "Completion Rate",
        icon: TrendingUp,
        value: "—",
        description: "This month",
        color: "text-purple-500",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back — here's what's happening.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((card) => (
                    <Card key={card.title} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
