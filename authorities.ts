
export interface Authority {
  name: string;
  lat: number;
  lng: number;
  phone: string;
}

export const authorities: Authority[] = [
  // Đà Nẵng
  { name: 'BQL Quận Hải Châu', lat: 16.0474, lng: 108.2197, phone: '02363822351' },
  { name: 'BQL Quận Thanh Khê', lat: 16.0614, lng: 108.1801, phone: '02363811881' },
  { name: 'BQL Quận Sơn Trà', lat: 16.0911, lng: 108.2616, phone: '02363844414' },
  { name: 'BQL Quận Ngũ Hành Sơn', lat: 16.0025, lng: 108.2492, phone: '02363847333' },
  { name: 'BQL Quận Liên Chiểu', lat: 16.0592, lng: 108.1384, phone: '02363841324' },
  { name: 'BQL Quận Cẩm Lệ', lat: 15.9988, lng: 108.1916, phone: '02363674111' },
  { name: 'BQL Huyện Hòa Vang', lat: 15.9867, lng: 108.0671, phone: '02363846112' },
  { name: 'BQL Huyện Hoàng Sa', lat: 16.5, lng: 112.0, phone: '02363822351' }, // Shared with Hai Chau for demo
  
  // Quảng Nam
  { name: 'BQL TP Tam Kỳ', lat: 15.5647, lng: 108.4811, phone: '02353852654' },
  { name: 'BQL TP Hội An', lat: 15.8801, lng: 108.3380, phone: '02353861254' },
  { name: 'BQL Thị xã Điện Bàn', lat: 15.8912, lng: 108.2415, phone: '02353867254' },
  { name: 'BQL Huyện Đại Lộc', lat: 15.8854, lng: 108.0054, phone: '02353865254' },
  { name: 'BQL Huyện Duy Xuyên', lat: 15.8197, lng: 108.2492, phone: '02353877254' },
  { name: 'BQL Huyện Thăng Bình', lat: 15.7412, lng: 108.3715, phone: '02353874254' },
  { name: 'BQL Huyện Quế Sơn', lat: 15.6812, lng: 108.1512, phone: '02353885254' },
  { name: 'BQL Huyện Núi Thành', lat: 15.4212, lng: 108.6512, phone: '02353871254' },
  { name: 'BQL Huyện Phú Ninh', lat: 15.5112, lng: 108.4512, phone: '02353895254' },
  { name: 'BQL Huyện Tiên Phước', lat: 15.4812, lng: 108.3112, phone: '02353884254' },
  { name: 'BQL Huyện Bắc Trà My', lat: 15.28, lng: 108.23, phone: '02353882254' },
  { name: 'BQL Huyện Nam Trà My', lat: 15.05, lng: 108.08, phone: '02353880254' },
  { name: 'BQL Huyện Phước Sơn', lat: 15.35, lng: 107.85, phone: '02353881254' },
  { name: 'BQL Huyện Hiệp Đức', lat: 15.55, lng: 108.05, phone: '02353883254' },
  { name: 'BQL Huyện Nông Sơn', lat: 15.65, lng: 107.95, phone: '02353886254' },
  { name: 'BQL Huyện Đông Giang', lat: 15.95, lng: 107.85, phone: '02353887254' },
  { name: 'BQL Huyện Nam Giang', lat: 15.65, lng: 107.65, phone: '02353888254' },
  { name: 'BQL Huyện Tây Giang', lat: 15.9, lng: 107.45, phone: '02353889254' }
];
