export class SalesPerformanceDto{
    productID:number;
    productName:string;
    totalSales:number;
    totalRevenue:number
}

export class RevenueDto{
    date:string
    totalRevenue:number
}

export class newUserDto{
    date:string
    newUsers:number
}

export class deliveryspeedDto{
    orderID:string
    deliverytime:number
}

export class salesTrendDto{
    date:string
    totalSales:number
    totalRevenue:number
}

export class CustomerRetentionDto{
    date:string
    retentionRate:number
}

export class AverageOrderValueDto{
    date:string
    averageOrderValue:number
}

export class userLifetimeValueDto{
    userID:number
    lifetimeValue:number

}

export class userfeedbackDto{
    productID:number
    averageRating:number
    totalReviews:number
}