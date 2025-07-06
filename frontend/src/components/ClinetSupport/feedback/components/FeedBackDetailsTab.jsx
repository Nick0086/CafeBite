import React from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar, User } from 'lucide-react'
import { getCategoryColor, getColor, getStatusLabel } from '../utils'
import { Separator } from '@/components/ui/separator'
import { Chip } from '@/components/ui/chip'

export default function FeedBackDetailsTab({ feedback }) {
    return (
        <div className="space-y-4" >
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feedback.title}</h3>
                    <div className="flex flex-wrap gap-3">
                        <Chip className='capitalize' variant='light' color={getColor(feedback.status)} radius='md' size='sm' border='none' >
                            {getStatusLabel(feedback.status)}
                        </Chip>

                        <Chip className='capitalize' variant='light' color={getCategoryColor(feedback.type)?.color} radius='md' size='sm' border='none' >
                            {getCategoryColor(feedback.type)?.label}
                        </Chip>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                <div className="flex items-center gap-2 sm:text-sm text-xs">
                    <User size={16} className=" text-gray-500" />
                    <span className="text-gray-600">Submitted by:</span>
                    <span className="font-medium">{feedback.first_name} {feedback.last_name}</span>
                </div>
                <div className="flex items-center gap-2 sm:text-sm text-xs">
                    <User size={16} className=" text-gray-500" />
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="font-medium">Admin</span>
                </div>
                <div className="flex items-center gap-2 sm:text-sm text-xs">
                    <Calendar size={16} className=" text-gray-500" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{feedback.created_at ? format(parseISO(feedback.created_at), 'dd-MM-yyyy hh:mm:ss a') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 sm:text-sm text-xs">
                    <Calendar size={16} className=" text-gray-500" />
                    <span className="text-gray-600">Last updated:</span>
                    <span className="font-medium">{feedback.updated_at ? format(parseISO(feedback.updated_at), 'dd-MM-yyyy hh:mm:ss a') : 'N/A'}</span>
                </div>
            </div>

            <Separator />


            <div>
                <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg sm:text-sm text-xs">{feedback.description}</p>
            </div>
        </div>
    )
}
