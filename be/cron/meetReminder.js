const cron = require("node-cron");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    console.log("🔔 Cron running at", now.toTimeString().slice(0, 5));

    const bookings = await Booking.find({
      bookingDate: currentDate,
      meetLink: { $exists: true, $ne: "" },
      notifiedBefore15m: { $ne: true },
      status: { $in: ["pending", "checked-in", "confirmed"] },
    });

    for (const booking of bookings) {
      if (!booking.startTime || !booking.startTime.includes(":")) {
        console.warn(`⚠️ Booking ${booking._id} có startTime không hợp lệ: ${booking.startTime}`);
        continue;
      }

      const [hour, minute] = booking.startTime.split(":").map(Number);
      const bookingMinutes = hour * 60 + minute;
      const diff = bookingMinutes - nowMinutes;

      console.log(`📆 ${currentDate} | 🕒 Now: ${nowMinutes}m | Booking: ${bookingMinutes}m | Diff: ${diff}m`);

      if (diff >= 14 && diff <= 16) {
        await Notification.create({
          notiName: "Sắp tới giờ tư vấn",
          notiDescription: `Buổi tư vấn của bạn sẽ bắt đầu sau 15 phút. Link Google Meet: ${booking.meetLink}`,
          userId: booking.userId,
          bookingId: booking._id,
        });

        booking.notifiedBefore15m = true;
        await booking.save();

        console.log(`✅ Đã gửi noti trước 15 phút cho booking ${booking._id}`);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi cron gửi meetLink:", err.message);
  }
});

