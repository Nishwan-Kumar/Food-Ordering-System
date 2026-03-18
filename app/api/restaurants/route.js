import connectDB from '@/lib/db';
import Restaurant from '@/lib/models/Restaurant';
import { authenticate } from '@/lib/auth';
import { authorize, countryFilter } from '@/lib/rbac';
import { successResponse, errorResponse } from '@/lib/response';

/** GET /api/restaurants — list restaurants in user's country */
export async function GET(request) {
    try {
        const user = await authenticate(request);
        authorize(user, 'view_restaurants');

        await connectDB();

        const restaurants = await Restaurant.find({
            ...countryFilter(user),
            isActive: true,
        }).sort({ name: 1 });

        return successResponse({ count: restaurants.length, data: { restaurants } });
    } catch (err) {
        return errorResponse(err);
    }
}
