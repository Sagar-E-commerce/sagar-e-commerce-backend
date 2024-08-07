export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum AdminType {
  SUPERADMIN = 'SuperAdmin',
  OTHER_ADMIN = 'otherAdmin',
}

export enum AdminAccessLevels {
  LEVEL1 = 'level1',
  LEVEL2 = 'level2',
  LEVEL3 = 'level3',
}

export enum ProductAvailability {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum OrderStatus {
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  PROCESSING = 'processing',
}

export enum OrderType {
  DOOR_DEIVERY = 'door_delivery',
  PICK_UP = 'pick_up',
}

export enum ORDERTYPE{
  COD ='cod',
  PREPAID = "prepaid"
}

export enum paymentType {
  DIRECT_TRANSFER = 'direct_transfer',
  CARD = 'card',
  PAY_ON_DELIVERY = 'pay_on_delivery',
}


export enum ShoppingExperience{
  EXCELLENT ="Excellent",
  GOOD = "Good",
  AVERAGE ="Average",
  POOR ="Poor"
}

export enum ProductBrowsingExperience{
  VERY_EASY = "Very Easy",
  EASY = "Easy",
  NEUTRAL ="Neutral",
  DIFFICULT ="Difficult"
}

export enum ProductAndImageDiscription{
  YES ="Yes",
  NO ="No"
}

export enum CategoryProductAvailabilitySatisfaction{
  SATISFACTORY ="Satisfactory",
  NEUTRAL = "Neutral",
  DISSATISFACTORY ="Dissatisfactory"
}

export enum LikelihoodOfWebsiteReccomendation{
  VERY_LIKELY = "Very Likely",
  NEUTRAL ="Neutral",
  NOT_LIKELY ="Not Likely"
}

export enum PaymentGateways{
  RAZORPAY="razorpay",
  CASHFREE="cashfree",
  PAYUMONEY="payUmoney"
}