import { APIRequestContext, test, expect, request } from '@playwright/test';

const baseUrl = process.env.NSHIFTBASEURL;
const bearerToken = process.env.NSHIFTBEARERTOKEN
const testExpress = false;

const testCases = [
  // Standard Shipping (Non-Pallet)
  
  {
    params: {
      tocountry: 'NL', // Netherlands
      tozipcode: '1011AB', // Valid postal code in the Netherlands
      weight: 2.5, // Weight < 3 kg
      pallet: false,
      cartprice: 150.0, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'DE'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 0, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 20, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'NL', // Netherlands
      tozipcode: '1011AB', // Valid postal code in the Netherlands
      weight: 2.5, // Weight < 3 kg
      pallet: false,
      cartprice: 50.0, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 8, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 20, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'NL', // Netherlands
      tozipcode: '1011AB', // Valid postal code in the Netherlands
      weight: 7, // Weight < 10 kg
      pallet: false,
      cartprice: 99.0, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 10, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 30, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'NL', // Netherlands
      tozipcode: '1011AB', // Valid postal code in the Netherlands
      weight: 11, // Weight > 10 kg
      pallet: false,
      cartprice: 50.0, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 15, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 40, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'FR', // France
      tozipcode: '75001', // Valid postal code in France
      weight: 18.5, // Weight < 3 kg
      pallet: false,
      cartprice: 100, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 0, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 80, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'FR', // France
      tozipcode: '75001', // Valid postal code in France
      weight: 1.5, // Weight < 3 kg
      pallet: false,
      cartprice: 99, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 10, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 40, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'FR', // France
      tozipcode: '75001', // Valid postal code in France
      weight: 5.5, // Weight < 10 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 15, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 60, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'FR', // France
      tozipcode: '75001', // Valid postal code in France
      weight: 10, // Weight > 10 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 21, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 80, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'PL', // Poland
      tozipcode: '00-001', // Valid postal code in Poland
      weight: 1.5, // Weight < 3 kg
      pallet: false,
      cartprice: 150, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 0, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 50, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'PL', // Poland
      tozipcode: '00-001', // Valid postal code in Poland
      weight: 1.5, // Weight < 3 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 25, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 50, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'PL', // Poland
      tozipcode: '00-001', // Valid postal code in Poland
      weight: 9.5, // Weight < 10 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 30, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 70, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'PL', // Poland
      tozipcode: '00-001', // Valid postal code in Poland
      weight: 118.5, // Weight > 10 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 35, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 90, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'usa01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'FI', // Finland
      tozipcode: '96100', // Valid postal code in Poland
      weight: 118.5, // Weight > 10 kg
      pallet: false,
      cartprice: 1050, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 0, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fec01'
        },
        {
          name: 'Express Shipping',
          priceValue: 90, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'FI', // Finland
      tozipcode: '96100', // Valid postal code in Poland
      weight: 0.18, // Weight < 3 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 20, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fec01'
        },
        {
          name: 'Express Shipping',
          priceValue: 50, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'FI', // Finland
      tozipcode: '96100', // Valid postal code in Poland
      weight: 8.5, // Weight < 10 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 21, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fec01'
        },
        {
          name: 'Express Shipping',
          priceValue: 70, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'FI', // Finland
      tozipcode: '96100', // Valid postal code in Poland
      weight: 18.5, // Weight > 10 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 28, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fec01'
        },
        {
          name: 'Express Shipping',
          priceValue: 90, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'GB', // United Kingdom
      tozipcode: 'SW1A1AA', // Valid postal code in United Kingdom
      weight: 4.5, // Weight > 10 kg
      pallet: false,
      cartprice: 150, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 0, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 70, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'GB', // United Kingdom
      tozipcode: 'SW1A1AA', // Valid postal code in United Kingdom
      weight: 0.5, // Weight < 3 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 20, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 50, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'GB', // United Kingdom
      tozipcode: 'SW1A1AA', // Valid postal code in United Kingdom
      weight: 3.0, // Weight < 10 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 21, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 70, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'GB', // United Kingdom
      tozipcode: 'SW1A1AA', // Valid postal code in United Kingdom
      weight: 10, // Weight > 10 kg
      pallet: false,
      cartprice: 50, // > €100
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 28, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 90, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'US', // United States
      tozipcode: '10001', // Valid postal code in the United States
      weight: 8.0, // Weight < 10 kg
      pallet: false,
      cartprice: 1800, // > $1000
      currency: 'USD', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 0, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 80, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'US', // United States
      tozipcode: '10001', // Valid postal code in the United States
      weight: 1.0, // Weight < 3 kg
      pallet: false,
      cartprice: 800, // > $1000
      currency: 'USD', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 35, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 40, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'US', // United States
      tozipcode: '10001', // Valid postal code in the United States
      weight: 8.0, // Weight < 10 kg
      pallet: false,
      cartprice: 800, // > $1000
      currency: 'USD', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 65, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 80, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'US', // United States
      tozipcode: '10001', // Valid postal code in the United States
      weight: 18.0, // Weight > 10 kg
      pallet: false,
      cartprice: 800, // > $1000
      currency: 'USD', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 90, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 160, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'VN', // Vietnam
      tozipcode: '790000', // Valid postal code in the Vietnam
      weight: 1.0, // Weight < 3 kg
      pallet: false,
      cartprice: 99999, // > $1000
      currency: 'USD', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 0, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 100, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'VN', // Vietnam
      tozipcode: '790000', // Valid postal code in the Vietnam
      weight: 2.99, // Weight < 3 kg
      pallet: false,
      cartprice: 999, // > $1000
      currency: 'USD', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 35, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 100, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'VN', // Vietnam
      tozipcode: '790000', // Valid postal code in the Vietnam
      weight: 9.99, // Weight < 10 kg
      pallet: false,
      cartprice: 999, // > $1000
      currency: 'USD', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 80, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 140, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fed e'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'VN', // Vietnam
      tozipcode: '790000', // Valid postal code in the Vietnam
      weight: 9999, // Weight > 10 kg
      pallet: false,
      cartprice: 999, // > $1000
      currency: 'USD', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping',
          priceValue: 130, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fec02'
        },
        {
          name: 'Express Shipping',
          priceValue: 190, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fed e'
        }
      ]
    }
  },








  // Standard Shipping (Pallet)
  {
    params: {
      tocountry: 'DE', // Germany
      tozipcode: '10115', // Valid postal code in Germany
      weight: 10.0, // Weight < 100 kg
      pallet: true,
      cartprice: 1000, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 150, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 250, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'DE', // Germany
      tozipcode: '10115', // Valid postal code in Germany
      weight: 110.0, // Weight > 100 kg
      pallet: true,
      cartprice: 1000, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 250, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 450, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'IT', // Italy
      tozipcode: '10115', // Valid postal code in Italy
      weight: 10.0, // Weight < 100 kg
      pallet: true,
      cartprice: 1000, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 175, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 500, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'IT', // Italy
      tozipcode: '10115', // Valid postal code in Italy
      weight: 110.0, // Weight > 100 kg
      pallet: true,
      cartprice: 1000, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 275, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 750, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'ES', // Spain
      tozipcode: '28001', // Valid postal code in Spain
      weight: 90.0, // Weight < 100 kg
      pallet: true,
      cartprice: 900, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 175, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 500, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'ES', // Spain
      tozipcode: '28001', // Valid postal code in Spain
      weight: 190.0, // Weight < 100 kg
      pallet: true,
      cartprice: 900, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 275, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 750, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'HU', // Hungary
      tozipcode: '1051', // Valid postal code in Hungary
      weight: 90.0, // Weight < 100 kg
      pallet: true,
      cartprice: 700, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 250, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 600, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'HU', // Hungary
      tozipcode: '1000', // Valid postal code in Bulgaria
      weight: 120.0, // Weight > 100 kg
      pallet: true,
      cartprice: 1200, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 350, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 975, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'BG', // Bulgary
      tozipcode: '1051', // Valid postal code in Bulgary
      weight: 90.0, // Weight < 100 kg
      pallet: true,
      cartprice: 700, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 250, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 600, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'BG', // Bulgary
      tozipcode: '1000', // Valid postal code in Bulgaria
      weight: 120.0, // Weight > 100 kg
      pallet: true,
      cartprice: 1200, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 350, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'cec01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 975, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'US', // US
      tozipcode: '28001', // Valid postal code in US
      weight: 90.0, // Weight < 100 kg
      pallet: true,
      cartprice: 900, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 750, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fef01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 1400, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'US', // US
      tozipcode: '28001', // Valid postal code in US
      weight: 190.0, // Weight < 100 kg
      pallet: true,
      cartprice: 900, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 1200, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fef01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 1800, // Price without currency sign
          estimatedDeliveryTime: 3,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'VN', // Vietnam
      tozipcode: '790000', // Valid postal code in Vietnam
      weight: 90.0, // Weight < 100 kg
      pallet: true,
      cartprice: 900, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 900, // Price without currency sign
          estimatedDeliveryTime: 8,
          method: 'fef01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 1400, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fpf01'
        }
      ]
    }
  },
  {
    params: {
      tocountry: 'VN', // Vietnam
      tozipcode: '790000', // Valid postal code in Vietnam
      weight: 190.0, // Weight < 100 kg
      pallet: true,
      cartprice: 900, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN'
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Standard Shipping Pallet',
          priceValue: 1300, // Price without currency sign
          estimatedDeliveryTime: 8,
          method: 'fef01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 1900, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fpf01'
        }
      ]
    }
  },
  
  //TAXI
  {
    params: {
      tocountry: 'VN', // Vietnam
      tozipcode: '790000', // Valid postal code in Vietnam
      weight: 190.0, // Weight < 100 kg
      pallet: true,
      cartprice: 900, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN',
	  customer_segment_0: 1
    },
    expected: {
      status: 200,
      options: [
        {
          name: 'Daily direct delivery service',
          priceValue: 0, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'Taxi'
        },
		{
          name: 'Standard Shipping Pallet',
          priceValue: 1300, // Price without currency sign
          estimatedDeliveryTime: 8,
          method: 'fef01'
        },
        {
          name: 'Express Shipping Pallet',
          priceValue: 1900, // Price without currency sign
          estimatedDeliveryTime: 5,
          method: 'fpf01'
        }
      ]
    }
  },
  
  //UPS9
  {
    params: {
      tocountry: 'NL', // Vietnam
      tozipcode: '8913 cv', // Valid postal code in Vietnam
      weight: 190.0, // Weight < 100 kg
      pallet: false,
      cartprice: 900, // > €1000
      currency: 'EUR', // Currency parameter added
      language: 'EN',
	  customer_segment_1: 16
    },
    expected: {
      status: 200,
      options: [
		{
          name: 'Standard Shipping',
          priceValue: 0, // Price without currency sign
          estimatedDeliveryTime: 2,
          method: 'ust01'
        },
        {
          name: 'Express Shipping',
          priceValue: 40, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'usa01'
        },
        {
          name: 'UPS9',
          priceValue: 150, // Price without currency sign
          estimatedDeliveryTime: 1,
          method: 'ups9'
        }
      ]
    }
  }
];

let apiContext: APIRequestContext;

// Use the `beforeAll` to create and configure the APIRequestContext
test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: baseUrl,
    extraHTTPHeaders: {
      'Authorization': `Bearer ${bearerToken}`,
    },
  });
});

// Dispose of the APIRequestContext after all tests
test.afterAll(async () => {
  await apiContext.dispose();
});

testCases.forEach((testCase, index) => {
  test(`Nshift #${index + 1}: ${testCase.params.tocountry}, ${testCase.params.weight} kg, ${testCase.params.pallet}`, async () => {
    // Send the API request with query parameters
    const response = await apiContext.get('', { params: testCase.params });

    // Assertions for the response
    expect(response.status()).toBe(200); // Check status code
    const responseBody = await response.json();
    const options = responseBody.options;
	console.log(responseBody);

    // Validate the response options
    expect(Array.isArray(options)).toBeTruthy();
    expect(options.length).toBe(testCase.expected.options.length);

    options.forEach((option, idx) => {
      expect(option.description2).toBe(testCase.expected.options[idx].method); // Check method
      expect(option.priceValue).toBe(testCase.expected.options[idx].priceValue); // Check price
      expect(option.description1).toContain(testCase.expected.options[idx].estimatedDeliveryTime.toString()); // Check delivery time
	  console.log(`Comparing values: option.priceValue = ${option.priceValue}, expected priceValue = ${testCase.expected.options[idx].priceValue}`);
    });

    if (testExpress) {
      // Non-Express test
      const expressParams = { ...testCase.params, express: 'false' };
      const nonExpressResponse = await apiContext.get('', { params: expressParams });
      expect(nonExpressResponse.status()).toBe(200);
      const nonExpressBody = await nonExpressResponse.json();
      expect(nonExpressBody.options.length).toBe(1);

      const nonExpressOption = nonExpressBody.options[0];
      expect(nonExpressOption.description2).toBe(testCase.expected.options[0].method);
      expect(nonExpressOption.priceValue).toBe(testCase.expected.options[0].priceValue);
      expect(nonExpressOption.description1).toContain(testCase.expected.options[0].estimatedDeliveryTime.toString());
	  console.log(`Comparing values: nonExpressOption.priceValue = ${nonExpressOption.priceValue}, expected priceValue = ${testCase.expected.options[0].priceValue}`);

      // Express test
      const expressParams2 = { ...testCase.params, express: 'true' };
      const expressResponse2 = await apiContext.get('', { params: expressParams2 });
      expect(expressResponse2.status()).toBe(200);
      const expressBody2 = await expressResponse2.json();
      expect(expressBody2.options.length).toBe(1);

      const expressOption2 = expressBody2.options[0];
      expect(expressOption2.description2).toBe(testCase.expected.options[1].method);
      expect(expressOption2.priceValue).toBe(testCase.expected.options[1].priceValue);
      expect(expressOption2.description1).toContain(testCase.expected.options[1].estimatedDeliveryTime.toString());
    }
  });
});
