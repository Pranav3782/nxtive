// Delivery provider contract. Any courier/logistics partner implements this shape.
export interface DeliveryProvider {
  createShipment: (input: unknown) => Promise<unknown>;
  trackShipment: (shipmentId: string) => Promise<unknown>;
  cancelShipment: (shipmentId: string) => Promise<void>;
}
