export interface CompletedKeyPoint {
  id: string;
  tourExecutionId: string;
  keyPointId: string;
  completedAt: string;
}

export type TourExecutionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface TourExecution {
  id: string;
  userId: string;
  tourId: string;
  status: TourExecutionStatus;
  lastActivityAt: string;
  completedKeyPoints: CompletedKeyPoint[];
  createdAt: string;
}
