import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { Card } from '../ui/card'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

export default function ClinetSupportIndex() {

  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState();

  useEffect(() => {
    const path = location.pathname.split('/');
    const tab = path[2]
    setSelectedTab(tab);
  }, [location]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    navigate(`/ticket-management/${tab}`);
  }

  return (
    <Card className='w-full rounded-sm overflow-hidden '>
      <div className="w-full mx-auto px-0">
        <Tabs value={selectedTab} className='border-none w-full' onValueChange={handleTabChange}>
          <TabsList className="flex flex-wrap w-full border-b border-gray-300">
            <TabsTrigger value="dashboard" variant="team" className="text-blue-500 border-blue-500 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-700">
              DashBoard
            </TabsTrigger>
            <TabsTrigger value="feedback" variant="team" className="text-red-500 border-red-500 data-[state=active]:bg-red-200 data-[state=active]:text-red-700">
              Feedback
            </TabsTrigger>
          </TabsList>
          <Outlet />
        </Tabs>
      </div>
    </Card>
  )
};