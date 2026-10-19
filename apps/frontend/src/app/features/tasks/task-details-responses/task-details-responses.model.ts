import {
  TaskApplicationResponse,
  TaskApplicationStatus,
} from '@freelance-platform/shared-types';
import { formatUserName } from '../../../format/format-user-name';

export type TaskDetailsResponseCard = {
  id: string;
  performerName: string;
  rating: number;
  reviewsCount: number;
  price: number | null;
  timeline: string | null;
  message: string;
  status: TaskApplicationStatus;
  error: string | null;
  isUpdating: boolean;
};

export function toTaskDetailsResponseCard(
  application: TaskApplicationResponse,
): TaskDetailsResponseCard {
  return {
    id: application.id,
    performerName: formatUserName(application.user),
    // TODO: рейтинг и число отзывов исполнителя в отклике пока всегда 0, бэкенд их не выбирает
    rating: application.user.rating,
    reviewsCount: application.user.reviewsCount,
    price: application.proposedPrice,
    timeline: application.timeline,
    message: application.message,
    status: application.status,
    error: null,
    isUpdating: false,
  };
}
