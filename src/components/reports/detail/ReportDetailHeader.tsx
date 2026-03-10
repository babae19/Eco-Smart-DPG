
import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReportDetailHeaderProps {
  title: string;
  issueType: string;
  status: 'pending' | 'approved' | 'rejected';
  location: string;
  date: string;
  createdBy: string;
}

export const ReportDetailHeader: React.FC<ReportDetailHeaderProps> = ({ 
  title, 
  issueType, 
  status, 
  location, 
  date,
  createdBy
}) => {
  const [reporterName, setReporterName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchReporterName = async () => {
      // Skip fetching if not authenticated to respect RLS
      if (!isAuthenticated) {
        setReporterName('Anonymous User');
        setLoading(false);
        return;
      }

      if (createdBy) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', createdBy)
            .single();
          
          if (data && data.full_name) {
            setReporterName(data.full_name);
          } else {
            setReporterName('Anonymous User');
          }
        } catch (error) {
          console.error('Error fetching reporter name:', error);
          setReporterName('Anonymous User');
        }
      } else {
        setReporterName('Anonymous User');
      }
      setLoading(false);
    };

    fetchReporterName();
  }, [createdBy, isAuthenticated]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-5">
      <div className="flex items-center mb-2">
        <span className="text-xs font-medium uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          {issueType}
        </span>
      </div>
      
      <h1 className="font-bold text-2xl text-gray-800 mb-2">{title}</h1>
      
      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
        {!loading && (
          <div className="flex items-center">
            <User size={16} className="mr-1 text-gray-400" />
            <span>Reported by: {reporterName}</span>
          </div>
        )}
        <div className="flex items-center">
          <MapPin size={16} className="mr-1 text-gray-400" />
          <span>{location}</span>
        </div>
        <div className="flex items-center">
          <Calendar size={16} className="mr-1 text-gray-400" />
          <span>{formatDate(date)}</span>
        </div>
      </div>
    </div>
  );
};
