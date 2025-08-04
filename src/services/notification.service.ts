export async function notifyOutbid(previousBidderId: string, auctionId: string, newBidAmount: number) {
  // TODO: Integrate with email, push, or websocket notification system
  // For now, just log
  console.log(`Notify user ${previousBidderId} for auction ${auctionId}: Outbid by ${newBidAmount}`);
}
