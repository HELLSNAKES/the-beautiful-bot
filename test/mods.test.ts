/* eslint-disable no-undef */

import * as mods from '../handlers/mods';

test('should test for each mod individually (string → int)', () => {
	expect(mods.toValue('MI')).toBe(1073741824);
	expect(mods.toValue('V2')).toBe(536870912);
	expect(mods.toValue('2K')).toBe(268435456);
	expect(mods.toValue('3K')).toBe(134217728);
	expect(mods.toValue('1K')).toBe(67108864);
	expect(mods.toValue('CO')).toBe(33554432);
	expect(mods.toValue('9K')).toBe(16777216);
	expect(mods.toValue('CN')).toBe(4194304);
	expect(mods.toValue('RD')).toBe(2097152);
	expect(mods.toValue('FI')).toBe(1048576);
	expect(mods.toValue('8K')).toBe(524288);
	expect(mods.toValue('7K')).toBe(262144);
	expect(mods.toValue('6K')).toBe(131072);
	expect(mods.toValue('5K')).toBe(65536);
	expect(mods.toValue('4K')).toBe(32768);
	expect(mods.toValue('PF')).toBe(16416);
	expect(mods.toValue('AP')).toBe(8192);
	expect(mods.toValue('SO')).toBe(4096);
	expect(mods.toValue('AO')).toBe(2048);
	expect(mods.toValue('FL')).toBe(1024);
	expect(mods.toValue('NC')).toBe(576);
	expect(mods.toValue('HT')).toBe(256);
	expect(mods.toValue('RX')).toBe(128);
	expect(mods.toValue('DT')).toBe(64);
	expect(mods.toValue('SD')).toBe(32);
	expect(mods.toValue('HR')).toBe(16);
	expect(mods.toValue('HD')).toBe(8);
	expect(mods.toValue('TD')).toBe(4);
	expect(mods.toValue('EZ')).toBe(2);
	expect(mods.toValue('NF')).toBe(1);
});

test('should test for each mod individually (int → string)', () => {
	expect(mods.toString(1073741824)).toBe('MI');
	expect(mods.toString(536870912)).toBe('V2');
	expect(mods.toString(268435456)).toBe('2K');
	expect(mods.toString(134217728)).toBe('3K');
	expect(mods.toString(67108864)).toBe('1K');
	expect(mods.toString(33554432)).toBe('CO');
	expect(mods.toString(16777216)).toBe('9K');
	expect(mods.toString(4194304)).toBe('CN');
	expect(mods.toString(2097152)).toBe('RD');
	expect(mods.toString(1048576)).toBe('FI');
	expect(mods.toString(524288)).toBe('8K');
	expect(mods.toString(262144)).toBe('7K');
	expect(mods.toString(131072)).toBe('6K');
	expect(mods.toString(65536)).toBe('5K');
	expect(mods.toString(32768)).toBe('4K');
	expect(mods.toString(16416)).toBe('PF');
	expect(mods.toString(8192)).toBe('AP');
	expect(mods.toString(4096)).toBe('SO');
	expect(mods.toString(2048)).toBe('AO');
	expect(mods.toString(1024)).toBe('FL');
	expect(mods.toString(576)).toBe('NC');
	expect(mods.toString(256)).toBe('HT');
	expect(mods.toString(128)).toBe('RX');
	expect(mods.toString(64)).toBe('DT');
	expect(mods.toString(32)).toBe('SD');
	expect(mods.toString(16)).toBe('HR');
	expect(mods.toString(8)).toBe('HD');
	expect(mods.toString(4)).toBe('TD');
	expect(mods.toString(2)).toBe('EZ');
	expect(mods.toString(1)).toBe('NF');
});

test('should test for random combination of mods (int → string)', () => {
	expect(mods.toString(88)).toBe('HDHRDT');
	expect(mods.toString(536870912)).toBe('V2');
	expect(mods.toString(536871939)).toBe('NFEZFLV2');
	expect(mods.toString(32832)).toBe('DT4K');
	expect(mods.toString(258)).toBe('EZHT');
	expect(mods.toString(24)).toBe('HDHR');
	expect(mods.toString(16424)).toBe('HDPF');
	expect(mods.toString(0)).toBe('No Mod');
	expect(mods.toString(1632)).toBe('SDNCFL');
});

test('should test for random combination of mods (string → int)', () => {
	expect(mods.toValue('HDHRDT')).toBe(88);
	expect(mods.toValue('V2')).toBe(536870912);
	expect(mods.toValue('NFEZFLV2')).toBe(536871939);
	expect(mods.toValue('DT4K')).toBe(32832);
	expect(mods.toValue('EZHT')).toBe(258);
	expect(mods.toValue('HDHR')).toBe(24);
	expect(mods.toValue('HDPF')).toBe(16424);
	expect(mods.toValue('No Mod')).toBe(0);
	expect(mods.toValue('SDNCFL')).toBe(1632);
});

test('should test for .has with a single find mod (string & string)', () => {
	expect(mods.has('HDDT', 'HD')).toBe(true);
	expect(mods.has('NC', 'NC')).toBe(true);
	expect(mods.has('4kEZ', '4k')).toBe(true);
	expect(mods.has('FLHDDTHR', 'HR')).toBe(true);
	expect(mods.has('V24kHDDT', '4k')).toBe(true);
	expect(mods.has('NFSDNCHD', 'SD')).toBe(true);
	expect(mods.has('NFEZTDHDHRSDDTRXHTNCFLAOSOAPPF4K5K6K7K8KFIRDCN9KCO1K3K2KV2MI', 'DT')).toBe(true);

	expect(mods.has('FLHDDT', 'HR')).toBe(false);
	expect(mods.has('NCHD', 'DT')).toBe(false);
	expect(mods.has('HDDTHRV2', '4k')).toBe(false);
	expect(mods.has('SDHDHRRX', 'FL')).toBe(false);
	expect(mods.has('NC', 'HR')).toBe(false);
	expect(mods.has('V2HDDT', 'PF')).toBe(false);
	expect(mods.has('NFEZTDHDHRRXNCFLAOSOAPPF4K5K6K7K8KFIRDCN9KCO1K3K2KV2MI', 'HT')).toBe(false);
});

test('should test for .has with a multiple find mods (string & string)', () => {
	expect(mods.has('HDDTHR', 'HDHR')).toBe(true);
	expect(mods.has('FLDTHDRX', 'RXFL')).toBe(true);
	expect(mods.has('PFHD', 'PFHD')).toBe(true);
	expect(mods.has('FLNCV2', 'V2FL')).toBe(true);
	expect(mods.has('V24kHDDT', '4kV2')).toBe(true);
	expect(mods.has('DTHDFLV2SD', 'SDDTHDFL')).toBe(true);
	expect(mods.has('NFEZTDHDHRSDDTRXHTNCFLAOSOAPPF4K5K6K7K8KFIRDCN9KCO1K3K2KV2MI', 'TDHDFLDTHRNF')).toBe(true);

	expect(mods.has('HDDTHR', 'HRFL')).toBe(false);
	expect(mods.has('DTTDFL', 'FLHD')).toBe(false);
	expect(mods.has('V24kMIFL', '9k')).toBe(false);
	expect(mods.has('V28kHDNC', 'HD9k')).toBe(false);
	expect(mods.has('NC', 'HRNC')).toBe(false);
	expect(mods.has('V2HDDT', 'PFHD')).toBe(false);
	expect(mods.has('NFEZTDHDHRSDDTRXNCFLAOSOAPPF4K5K6K7K8KFIRDCN9KCO1K3K2KV2MI', 'HTHDEZNFPF')).toBe(false);
});

test('should test for .has with a single find mod (int & string)', () => {
	expect(mods.has(72, 'HD')).toBe(true);
	expect(mods.has(576, 'NC')).toBe(true);
	expect(mods.has('32768', '4k')).toBe(true);
	expect(mods.has(1112, 'HR')).toBe(true);
	expect(mods.has('536903752', '4k')).toBe(true);
	expect(mods.has(617, 'SD')).toBe(true);
	expect(mods.has(2139094783, 'DT')).toBe(true);

	expect(mods.has(1096, 'HR')).toBe(false);
	// expect(mods.has(584, 'DT')).toBe(false); // debatable implementation but this is true for now
	expect(mods.has('536871000', '4k')).toBe(false);
	expect(mods.has('184', 'FL')).toBe(false);
	expect(mods.has(576, 'HR')).toBe(false);
	expect(mods.has('536870984', 'PF')).toBe(false);
	expect(mods.has(2139094783, 'HT')).toBe(false);
});

test('should test for .has with a multiple find mods (int & string)', () => {
	expect(mods.has(88, 'HDHR')).toBe(true);
	expect(mods.has(1224, 'RXFL')).toBe(true);
	expect(mods.has(16424, 'PFHD')).toBe(true);
	expect(mods.has(536872512, 'V2FL')).toBe(true);
	expect(mods.has(536903752, '4kV2')).toBe(true);
	expect(mods.has(536872040, 'SDDTHDFL')).toBe(true);
	expect(mods.has(2139094783, 'TDHDFLDTHRNF')).toBe(true);

	expect(mods.has(88, 'HRFL')).toBe(false);
	expect(mods.has(1092, 'FLHD')).toBe(false);
	expect(mods.has(1610646528, '9k')).toBe(false);
	expect(mods.has(537395784, 'HD9k')).toBe(false);
	expect(mods.has(576, 'HRNC')).toBe(false);
	expect(mods.has(536870984, 'PFHD')).toBe(false);
	expect(mods.has(2139094783, 'HTHDEZNFPF')).toBe(false);
});