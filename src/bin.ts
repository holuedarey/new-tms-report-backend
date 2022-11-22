

const BINS = [
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "VISA",
      "bin": 400066
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "VISA",
      "bin": 404905
    },
    {
      "bank": "WELLS FARGO BANK NEVADA, N.A.",
      "brand": "VISA",
      "bin": 405030
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 407127
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "VISA",
      "bin": 407467
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "VISA",
      "bin": 407469
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "VISA",
      "bin": 407591
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "VISA",
      "bin": 408301
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "VISA",
      "bin": 408304
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "VISA",
      "bin": 408378
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 408380
    },
    {
      "bank": "MAINSTREET BANK LIMITED",
      "brand": "VISA",
      "bin": 408407
    },
    {
      "bank": "AFRIBANK NIGERIA PLC",
      "brand": "VISA",
      "bin": 408408
    },
    {
      "bank": "AFRIBANK NIGERIA PLC",
      "brand": "VISA",
      "bin": 408409
    },
    {
      "bank": "AFRIBANK NIGERIA PLC",
      "brand": "VISA",
      "bin": 408410
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "VISA",
      "bin": 408423
    },
    {
      "bank": "ZENITH BANK PLC",
      "brand": "VISA",
      "bin": 412053
    },
    {
      "bank": "ZENITH BANK PLC",
      "brand": "VISA",
      "bin": 413183
    },
    {
      "bank": "STANDARD CHARTERED BANK NIGERIA",
      "brand": "VISA",
      "bin": 417059
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "VISA",
      "bin": 419225
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "VISA",
      "bin": 419227
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 419760
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 419761
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 419762
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 419763
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 419764
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 419765
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 419766
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 419767
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 419768
    },
    {
      "bank": "GUARANTY TRUST BANK PLC",
      "brand": "VISA",
      "bin": 420319
    },
    {
      "bank": "GUARANTY TRUST BANK PLC",
      "brand": "VISA",
      "bin": 420321
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "VISA",
      "bin": 420359
    },
    {
      "bank": "STANDARD CHARTERED BANK NIGERIA, LTD.",
      "brand": "VISA",
      "bin": 422127
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "VISA",
      "bin": 422584
    },
    {
      "bank": "STANDARD CHARTERED BANK NIGERIA, LTD.",
      "brand": "VISA",
      "bin": 423895
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "VISA",
      "bin": 424226
    },
    {
      "bank": "VALUCARD NIGERIA PLC",
      "brand": "VISA",
      "bin": 424367
    },
    {
      "bank": "VALUCARD NIGERIA PLC",
      "brand": "VISA",
      "bin": 424465
    },
    {
      "bank": "FIRST BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 427011
    },
    {
      "bank": "FIRST BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 427013
    },
    {
      "bank": "FIRST BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 427014
    },
    {
      "bank": "BANK PHB PLC",
      "brand": "VISA",
      "bin": 428502
    },
    {
      "bank": "OCEANIC BANK INTERNATIONAL (NIGERIA) PLC",
      "brand": "VISA",
      "bin": 427872
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "VISA",
      "bin": 427873
    },
    {
      "bank": "DIAMOND BANK, LTD.",
      "brand": "VISA",
      "bin": 427875
    },
    {
      "bank": "FIRST BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 427876
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "VISA",
      "bin": 427877
    },
    {
      "bank": "STANDARD CHARTERED BANK NIGERIA, LTD.",
      "brand": "VISA",
      "bin": 427889
    },
    {
      "bank": "BANK PHB PLC",
      "brand": "VISA",
      "bin": 428504
    },
    {
      "bank": "GUARANTY TRUST BANK PLC",
      "brand": "VISA",
      "bin": 428222
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "VISA",
      "bin": 433960
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "VISA",
      "bin": 437360
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "VISA",
      "bin": 444585
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "VISA",
      "bin": 444586
    },
    {
      "bank": "STERLING BANK PLC",
      "brand": "VISA",
      "bin": 445817
    },
    {
      "bank": "FIDELITY BANK PLC",
      "brand": "VISA",
      "bin": 446965
    },
    {
      "bank": "ZENITH BANK PLC",
      "brand": "VISA",
      "bin": 450073
    },
    {
      "bank": "ZENITH BANK PLC",
      "brand": "VISA",
      "bin": 450075
    },
    {
      "bank": "ZENITH BANK PLC",
      "brand": "VISA",
      "bin": 450090
    },
    {
      "bank": "ZENITH BANK PLC",
      "brand": "VISA",
      "bin": 450091
    },
    {
      "bank": "ZENITH BANK PLC",
      "brand": "VISA",
      "bin": 450093
    },
    {
      "bank": "STANBIC IBTC BANK PLC",
      "brand": "VISA",
      "bin": 457766
    },
    {
      "bank": "STANBIC IBTC BANK PLC",
      "brand": "VISA",
      "bin": 457768
    },
    {
      "bank": "STANBIC IBTC BANK PLC",
      "brand": "VISA",
      "bin": 457769
    },
    {
      "bank": "STANBIC IBTC BANK PLC",
      "brand": "VISA",
      "bin": 457770
    },
    {
      "bank": "STANBIC IBTC BANK PLC",
      "brand": "VISA",
      "bin": 457771
    },
    {
      "bank": "WEMA BANK",
      "brand": "VISA",
      "bin": 457803
    },
    {
      "bank": "WEMA BANK",
      "brand": "VISA",
      "bin": 457804
    },
    {
      "bank": "WEMA BANK",
      "brand": "VISA",
      "bin": 457805
    },
    {
      "bank": "WEMA BANK",
      "brand": "VISA",
      "bin": 457806
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 457807
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "VISA",
      "bin": 458274
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "VISA",
      "bin": 458301
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "VISA",
      "bin": 458478
    },
    {
      "bank": "STANDARD CHARTERED BANK NIGERIA",
      "brand": "VISA",
      "bin": 458588
    },
    {
      "bank": "FIDELITY BANK PLC",
      "brand": "VISA",
      "bin": 458792
    },
    {
      "bank": "FIDELITY BANK PLC",
      "brand": "VISA",
      "bin": 458793
    },
    {
      "bank": "FIDELITY BANK PLC",
      "brand": "VISA",
      "bin": 460054
    },
    {
      "bank": "FIDELITY BANK PLC",
      "brand": "VISA",
      "bin": 460055
    },
    {
  
      "bank": "----",
      "brand": "VISA",
      "bin": 467768
    },
    {
      "bank": "FIRST CITY MONUMENT BANK PLC",
      "brand": "VISA",
      "bin": 467874
    },
    {
      "bank": "FIRST CITY MONUMENT BANK PLC",
      "brand": "VISA",
      "bin": 467875
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 468588
    },
    {
      "bank": "AFRIBANK NIGERIA PLC",
      "brand": "VISA",
      "bin": 469617
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "VISA",
      "bin": 469665
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "VISA",
      "bin": 469666
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "VISA",
      "bin": 469667
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "VISA",
      "bin": 470484
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 470651
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 470653
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 470654
    },
    {
      "bank": "STANDARD CHARTERED BANK NIGERIA",
      "brand": "VISA",
      "bin": 471463
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "VISA",
      "bin": 472482
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 473845
    },
    {
      "bank": "INTERPAYMENT SERVICES, LTD.",
      "brand": "VISA",
      "bin": 474121
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "VISA",
      "bin": 475177
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "VISA",
      "bin": 484842
    },
    {
      "bank": "CITIBANK NIGERIA, LTD.",
      "brand": "VISA",
      "bin": 485451
    },
    {
      "bank": "CITIBANK NIGERIA, LTD.",
      "brand": "MASTERCARD",
      "bin": 533031
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 485483
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 485484
    },
    {
      "bank": "CITIBANK NIGERIA, LTD.",
      "brand": "VISA",
      "bin": 486508
    },
    {
      "bank": "----",
      "brand": "VISA",
      "bin": 496009
    },
    {
      "bank": "DIAMOND BANK, LTD.",
      "brand": "VISA",
      "bin": 496021
    },
    {
      "bank": "DIAMOND BANK, LTD.",
      "brand": "VISA",
      "bin": 496022
    },
    {
      "bank": "DIAMOND BANK, LTD.",
      "brand": "VISA",
      "bin": 496023
    },
    {
      "bank": "DIAMOND BANK, LTD.",
      "brand": "VISA",
      "bin": 496024
    },
    {
      "bank": "DIAMOND BANK, LTD.",
      "brand": "VISA",
      "bin": 496026
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 512269
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 512450
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 512451
    },
    {
      "bank": "----",
      "brand": "MASTERCARD",
      "bin": 514585
    },
    {
      "bank": "----",
      "brand": "MASTERCARD",
      "bin": 519885
    },
    {
      "bank": "CSCBANK S.A.L.",
      "brand": "MASTERCARD",
      "bin": 515692
    },
    {
      "bank": "CSCBANK S.A.L.",
      "brand": "MASTERCARD",
      "bin": 515883
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "MASTERCARD",
      "bin": 517754
    },
    {
      "bank": " ENTERPRISE BANK, LTD ",
      "brand": "MASTERCARD",
      "bin": 518304
    },
    {
      "bank": "FIRST BANK OF NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 519878
    },
    {
      "bank": "STANDARD BANK",
      "brand": "MASTERCARD",
      "bin": 519899
    },
    {
      "bank": "----",
      "brand": "MASTERCARD",
      "bin": 519902
    },
    {
      "bank": " ACCESS BANK PLC",
      "brand": "MASTERCARD",
      "bin": 519904
    },
    {
      "bank": "STANDARD BANK",
      "brand": "MASTERCARD",
      "bin": 519905
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "MASTERCARD",
      "bin": 519908
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "MASTERCARD",
      "bin": 519911
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "MASTERCARD",
      "bin": 520053
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "MASTERCARD",
      "bin": 521090
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "MASTERCARD",
      "bin": 521623
    },
    {
      "bank": "WEMA BANK PLC",
      "brand": "MASTERCARD",
      "bin": 521958
    },
    {
      "bank": "ZENITH BANK",
      "brand": "MASTERCARD",
      "bin": 521982
    },
    {
      "bank": "UNITY BANK PLC",
      "brand": "MASTERCARD",
      "bin": 521988
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "MASTERCARD",
      "bin": 522899
    },
    {
      "bank": "ENTERPRISE BANK, LTD.",
      "brand": "MASTERCARD",
      "bin": 523740
    },
    {
      "bank": "ENTERPRISE BANK, LTD.",
      "brand": "MASTERCARD",
      "bin": 523776
    },
    {
      "bank": "FIDELITY BANK PLC",
      "brand": "MASTERCARD",
      "bin": 524271
    },
    {
      "bank": "----",
      "brand": "MASTERCARD",
      "bin": 524275
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "MASTERCARD",
      "bin": 524311
    },
    {
      "bank": "STANDARD BANK OF SOUTH AFRICA",
      "brand": "MASTERCARD",
      "bin": 524687
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "MASTERCARD",
      "bin": 525634
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "MASTERCARD",
      "bin": 525685
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 525993
    },
    {
      "bank": "CREDIT UNION PAYMENT CENTER-",
      "brand": "MASTERCARD",
      "bin": 525994
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "MASTERCARD",
      "bin": 526897
    },
    {
      "bank": "CSCBANK S.A.L.",
      "brand": "MASTERCARD",
      "bin": 528047
    },
    {
      "bank": "STANDARD BANK OF SOUTH AFRICA",
      "brand": "MASTERCARD",
      "bin": 528650
    },
    {
      "bank": "----",
      "brand": "MASTERCARD",
      "bin": 528655
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "MASTERCARD",
      "bin": 528668
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 528917
    },
    {
      "bank": "----",
      "brand": "MASTERCARD",
      "bin": 529539
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "MASTERCARD",
      "bin": 529975
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "MASTERCARD",
      "bin": 531165
    },
    {
      "bank": "ZENITH BANK",
      "brand": "MASTERCARD",
      "bin": 531525
    },
    {
      "bank": "CSCBANK S.A.L.",
      "brand": "MASTERCARD",
      "bin": 532330
    },
    {
      "bank": "GUARANTY TRUST BANK",
      "brand": "MASTERCARD",
      "bin": 532732
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 532968
    },
    {
      "bank": " KENYA COMMERCIAL BANK",
      "brand": "MASTERCARD",
      "bin": 533887
    },
    {
      "bank": "CSCBANK S.A.L.",
      "brand": "MASTERCARD",
      "bin": 535955
    },
    {
      "bank": "----",
      "brand": "MASTERCARD",
      "bin": 536439
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 537010
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 537011
    },
    {
      "bank": "ENTERPRISE BANK, LTD.",
      "brand": "MASTERCARD",
      "bin": 537610
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "MASTERCARD",
      "bin": 539586
    },
    {
      "bank": "FIRST BANK OF NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 539923
    },
    {
      "bank": "ZENITH BANK",
      "brand": "MASTERCARD",
      "bin": 539941
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "MASTERCARD",
      "bin": 540648
    },
    {
      "bank": "ZENITH BANK",
      "brand": "MASTERCARD",
      "bin": 540884
    },
    {
      "bank": "GUARANTY TRUST BANK PLC",
      "brand": "MASTERCARD",
      "bin": 541508
    },
    {
      "bank": "GUARANTY TRUST BANK",
      "brand": "MASTERCARD",
      "bin": 541569
    },
    {
      "bank": "ZENITH BANK",
      "brand": "MASTERCARD",
      "bin": 542231
    },
    {
      "bank": "FIRST BANK OF NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 543338
    },
    {
      "bank": "ZENITH BANK",
      "brand": "MASTERCARD",
      "bin": 547160
    },
    {
      "bank": "CSCBANK S.A.L.",
      "brand": "MASTERCARD",
      "bin": 547638
    },
    {
      "bank": "OCEANIC BANK",
      "brand": "MASTERCARD",
      "bin": 548644
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 548712
    },
    {
      "bank": "CSCBANK S.A.L.",
      "brand": "MASTERCARD",
      "bin": 550019
    },
    {
      "bank": "UNITY BANK PLC",
      "brand": "MASTERCARD",
      "bin": 551609
    },
    {
      "bank": "STANBIC IBTC BANK",
      "brand": "MASTERCARD",
      "bin": 552160
    },
    {
      "bank": "GUARANTY TRUST BANK PLC",
      "brand": "MASTERCARD",
      "bin": 552264
    },
    {
      "bank": "GUARANTY TRUST BANK",
      "brand": "MASTERCARD",
      "bin": 552279
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "MASTERCARD",
      "bin": 553420
    },
    {
      "bank": "CITIBANK NIGERIA, LTD.",
      "brand": "MASTERCARD",
      "bin": 555060
    },
    {
      "bank": "CITIBANK NIGERIA, LTD.",
      "brand": "MASTERCARD",
      "bin": 555061
    },
    {
      "bank": "CITIBANK NIGERIA, LTD.",
      "brand": "MASTERCARD",
      "bin": 555062
    },
    {
      "bank": "BANK PHB PLC",
      "brand": "MASTERCARD",
      "bin": 555940
    },
    {
      "bank": "ZENITH BANK",
      "brand": "MASTERCARD",
      "bin": 556350
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "MASTERCARD",
      "bin": 557581
    },
    {
      "bank": "CSCBANK S.A.L.",
      "brand": "MASTERCARD",
      "bin": 557972
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "MASTERCARD",
      "bin": 558773
    },
    {
      "bank": "STANDARD BANK OF SOUTH AFRICA",
      "brand": "MASTERCARD",
      "bin": 559424
    },
    {
      "bank": "STANDARD BANK OF SOUTH AFRICA",
      "brand": "MASTERCARD",
      "bin": 559432
    },
    {
      "bank": "WEMA BANK PLC",
      "brand": "MASTERCARD",
      "bin": 559441
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "MASTERCARD",
      "bin": 559447
    },
    {
      "bank": "WEMA BANK PLC",
      "brand": "MASTERCARD",
      "bin": 559453
    },
    {
      "bank": "Guaranty Trust Bank",
      "brand": "Mastercard",
      "bin": 539983
    },
    {
      "bank": "ZENITH BANK",
      "brand": "Mastercard Cirrus",
      "bin": 513469
    },
    {
      "bank": "HERITAGE BANKING COMPANY, LTD.",
      "brand": "Mastercard Cirrus",
      "bin": 512934
    },
    {
      "bank": "Zenith Bank",
      "brand": "Mastercard",
      "bin": 512336
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "Mastercard",
      "bin": 557694
    },
    {
      "bank": "Intercontinental Bank Plc",
      "brand": "Mastercard",
      "bin": 557693
    },
    {
      "bank": "GUARANTY TRUST BANK PLC",
      "brand": "Mastercard Mastercard",
      "bin": 522340
    },
    {
      "bank": "Unity Bank Plc",
      "brand": "Mastercard",
      "bin": 536399
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "Mastercard Cirrus",
      "bin": 519909
    },
    {
      "bank": "FIRST BANK OF NIGERIA PLC",
      "brand": "Mastercard Cirrus",
      "bin": 519510
    },
    {
      "bank": "----",
      "brand": "Visa",
      "bin": 488992
    },
    {
      "bank": "----",
      "brand": "Visa Visa.",
      "bin": 482132
    },
    {
      "bank": "Union Bank Of Nigeria",
      "brand": "Visa",
      "bin": 469023
    },
    {
      "bank": "FIDELITY BANK PLC",
      "brand": "Visa Visa Gold",
      "bin": 460053
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "Visa Visa.",
      "bin": 458536
    },
    {
      "bank": "Cscbank S.A.L.",
      "brand": "Mastercard",
      "bin": 533897
    },
    {
      "bank": "STERLING BANK PLC",
      "brand": "Mastercard Cirrus",
      "bin": 533678
    },
    {
      "bank": "----",
      "brand": "Visa Visa Platinum",
      "bin": 457789
    },
    {
      "bank": "Zenith Bank",
      "brand": "Mastercard",
      "bin": 533301
    },
    {
      "bank": "FIRST CITY MONUMENT BANK PLC",
      "brand": "Visa Visa.",
      "bin": 432226
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "Visa Visa Gold",
      "bin": 475176
    },
    {
      "bank": "Guaranty Trust Bank Plc",
      "brand": "Visa",
      "bin": 445807
    },
    {
      "bank": "----",
      "brand": "Visa Visa Platinum",
      "bin": 420335
    },
    {
      "bank": " UNION BANK OF NIGERIA PLC",
      "brand": "Visa Visa.",
      "bin": 420332
    },
    {
      "bank": "SKYE BANK PLC",
      "brand": "Visa",
      "bin": 419228
    },
    {
      "bank": "Skye Bank Plc",
      "brand": "Visa",
      "bin": 419226
    },
    {
      "bank": "Access",
      "brand": "Visa",
      "bin": 418742
    },
    {
      "bank": "UNITY BANK PLC",
      "brand": "Mastercard Cirrus",
      "bin": 532155
    },
    {
      "bank": "ACCESS BANK PLC",
      "brand": "Mastercard Cirrus",
      "bin": 531931
    },
    {
      "bank": "UNITED BANK FOR AFRICA PLC",
      "brand": "Visa Visa.",
      "bin": 444582
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "Mastercard Mc Prepaid",
      "bin": 531505
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "Mastercard Mc Prepaid",
      "bin": 531504
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "Mastercard Mc Prepaid",
      "bin": 531499
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "Mastercard Mc Prepaid",
      "bin": 531498
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "Mastercard",
      "bin": 531224
    },
    {
      "bank": "OCEANIC BANK INTERNATIONAL PLC",
      "brand": "Visa",
      "bin": 428603
    },
    {
      "bank": "BANK PHB PLC",
      "brand": "Visa Visa.",
      "bin": 428503
    },
    {
      "bank": "BANK PHB PLC",
      "brand": "Visa Visa Gold",
      "bin": 428501
    },
    {
      "bank": "BANK PHB PLC",
      "brand": "Visa Visa.",
      "bin": 428500
    },
    {
      "bank": "Intercontinental Bank Plc",
      "brand": "Visa",
      "bin": 408424
    },
    {
      "bank": "Intercontinental Bank Plc",
      "brand": "Visa",
      "bin": 408422
    },
    {
      "bank": "OCEANIC BANK INTERNATIONAL PLC",
      "brand": "Visa Visa Gold",
      "bin": 408379
    },
    {
      "bank": "INTERCONTINENTAL BANK PLC",
      "brand": "Visa Visa Platinum",
      "bin": 408303
    },
    {
      "bank": " INTERCONTINENTAL BANK PLC",
      "brand": "Visa Visa Gold",
      "bin": 408302
    },
    {
      "bank": "Union Bank Of Nigeria Plc",
      "brand": "Visa",
      "bin": 428272
    },
    {
      "bank": "----",
      "brand": "Visa Visa Infinite",
      "bin": 471459
    },
    {
      "bank": "----",
      "brand": "Visa Visa Gold",
      "bin": 471458
    },
    {
      "bank": "STANDARD CHARTERED BANK NIGERIA",
      "brand": "Visa Visa Gold",
      "bin": 471415
    },
    {
      "bank": "----",
      "brand": "Visa Visa Corporate",
      "bin": 443893
    },
    {
      "bank": "ECOBANK NIGERIA PLC",
      "brand": "Mastercard Cirrus",
      "bin": 529751
    },
    {
      "bank": "ZENITH BANK",
      "brand": "Mastercard",
      "bin": 529720
    },
    {
      "bank": "----",
      "brand": "Visa Visa.",
      "bin": 470655
    },
    {
      "bank": "----",
      "brand": "Visa Visa Gold",
      "bin": 470652
    },
    {
      "bank": "----",
      "brand": "Visa Visa.",
      "bin": 406995
    },
    {
      "bank": "Ecobank Nigeria Plc",
      "brand": "Mastercard",
      "bin": 531667
    },
    {
      "bank": "STANDARD BANK OF SOUTH AFRICA",
      "brand": "Mastercard",
      "bin": 528649
    },
    {
      "bank": "----",
      "brand": "Visa Visa Gold",
      "bin": 416919
    },
    {
      "bank": "Access Bank Plc",
      "brand": "Visa",
      "bin": 412702
    },
    {
      "bank": "Banco Caja De Ahorro, S.A.",
      "brand": "Visa",
      "bin": 499908
    },
    {
      "bank": "American Express",
      "brand": "American Express",
      "bin": 376862
    },
    {
      "bank": "United Bank For Africa Plc",
      "brand": "Visa",
      "bin": 422594
    },
    {
      "bank": "----",
      "brand": "Visa",
      "bin": 422500
    },
    {
      "bank": "Standard Chartered Bank Nigeria, Ltd.",
      "brand": "Visa",
      "bin": 422808
    },
    {
      "bank": "Zenith Bank",
      "brand": "Mastercard",
      "bin": 559443
    },
    {
      "bank": "Cscbank S.A.L.",
      "brand": "Mastercard",
      "bin": 557669
    },
    {
      "bank": "STANDARD CHARTERED BANK NIGERIA",
      "brand": "Visa",
      "bin": 458587
    },
    {
      "bank": "Visa New Zealand",
      "brand": "Visa",
      "bin": 499910
    },
    {
      "bank": "Intercontinental Bank Plc",
      "brand": "Mastercard",
      "bin": 531213
    },
    {
      "bank": "OCEANIC BANK INTERNATIONAL PLC",
      "brand": "Mastercard",
      "bin": 539948
    },
    {
      "bank": "Cscbank S.A.L.",
      "brand": "Mastercard",
      "bin": 528955
    },
    {
      "bank": "Guaranty Trust Bank Plc",
      "brand": "Visa",
      "bin": 420320
    },
    {
      "bank": "First Bank Of Nigeria Plc",
      "brand": "Visa",
      "bin": 427012
    },
    {
      "bank": "Access Bank Plc",
      "brand": "Visa",
      "bin": 403660
    },
    {
      "bank": " INTERCONTINENTAL BANK PLC",
      "brand": "Visa",
      "bin": 408305
    },
    {
      "bank": "----",
      "brand": "Visa",
      "bin": 471449
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "Visa",
      "bin": 420334
    },
    {
      "bank": "Zenith Bank Plc",
      "brand": "Visa",
      "bin": 450074
    },
    {
      "bank": "Access Bank Plc",
      "brand": "Visa",
      "bin": 407586
    },
    {
      "bank": "Access Bank Plc",
      "brand": "Visa",
      "bin": 475175
    },
    {
      "bank": "Zenith Bank",
      "brand": "Mastercard",
      "bin": 530519
    },
    {
      "bank": "Wema Bank Plc",
      "brand": "Visa",
      "bin": 428270
    },
    {
      "bank": "ZENITH BANK",
      "brand": "Mastercard",
      "bin": 549970
    },
    {
      "bank": "Zenith Bank",
      "brand": "Mastercard",
      "bin": 515803
    },
    {
      "bank": "OCEANIC BANK INTERNATIONAL PLC",
      "brand": "Visa",
      "bin": 428602
    },
    {
      "bank": "Ecobank Nigeria Plc",
      "brand": "Mastercard",
      "bin": 528916
    },
    {
      "bank": "Skye Bank Plc",
      "brand": "Mastercard",
      "bin": 539945
    },
    {
      "bank": "Banco Caja De Ahorro, S.A.",
      "brand": "Visa",
      "bin": 499909
    },
    {
      "bank": " INTERCONTINENTAL BANK PLC",
      "brand": "Visa",
      "bin": 408425
    },
    {
      "bank": "Stanbic Ibtc Bank",
      "brand": "Mastercard",
      "bin": 542077
    },
    {
      "bank": "United Bank For Africa Plc",
      "brand": "Visa",
      "bin": 428223
    },
    {
      "bank": "Access Bank Plc",
      "brand": "Visa",
      "bin": 418743
    },
    {
      "bank": "United Bank For Africa Plc",
      "brand": "Visa",
      "bin": 420358
    },
    {
      "bank": "Zenith Bank Plc",
      "brand": "Visa",
      "bin": 413103
    },
    {
      "bank": "ZENITH BANK PLC",
      "brand": "Visa",
      "bin": 450092
    },
    {
      "bank": "----",
      "brand": "Visa",
      "bin": 445493
    },
    {
      "bank": "Standard Chartered Bank Nigeria, Ltd.",
      "brand": "Visa",
      "bin": 439358
    },
    {
      "bank": "AFRIBANK NIGERIA PLC",
      "brand": "Visa",
      "bin": 428225
    },
    {
      "bank": "UNION BANK OF NIGERIA PLC",
      "brand": "Visa",
      "bin": 420333
    },
    {
      "bank": "Ecobank Nigeria Plc",
      "brand": "Mastercard",
      "bin": 548458
    },
    {
      "bank": "STANDARD CHARTERED BANK NIGERIA",
      "brand": "Visa",
      "bin": 471464
    },
    {
      "bank": "Intercontinental Bank Plc",
      "brand": "Visa",
      "bin": 408421
    },
    {
      "bank": "Guaranty Trust Bank",
      "brand": "Mastercard",
      "bin": 533853
    },
    {
      "bank": "Guaranty Trust Bank Plc",
      "brand": "Mastercard",
      "bin": 533856
    },
    {
      bank: 'JP Morgan Chase Bank',
      brand: 'Mastercard',
      bin: 521973
    },
    
    {
      bank: 'JP Morgan Chase Bank',
      brand: 'Visa',
      bin: 413185
    },
    
    {
      bank: 'JP Morgan Chase Bank',
      brand: 'Mastercard',
      bin: 521952
    },
    {
      bank: 'JP Morgan Chase Bank',
      brand: 'Visa',
      bin: 467875
    },
    
    {
      bank: 'JP Morgan Chase Bank',
      brand: 'Visa',
      bin: 422500
    },
    
    {
      bank: 'JP Morgan Chase Bank',
      brand: 'Visa',
      bin: 467874
    },
    
    {
      bank: 'JP Morgan Chase Bank',
      brand: 'Visa',
      bin: 467817
    }
  ]
  
  // eslint-disable-next-line import/prefer-default-export
  export { BINS };